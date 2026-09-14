import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trainingService } from '@/services/training.service';
import type { ApiError } from '@/types/api.types';
import type {
  TrainingDetailView,
  TrainingEnrolmentApiItem,
  TrainingListQuery,
  TrainingWishlistApiItem,
} from '@/types/training.types';
import { mapTrainingsApiToListItems } from '@/utils/marketTraining.mapper';
import { mapTrainingContentToProgressPath } from '@/utils/marketTrainingContent.mapper';
import { mapWishlistApiItem } from '@/utils/marketTrainingWishlist.mapper';

export const trainingKeys = {
  all: ['trainings'] as const,
  list: (params: TrainingListQuery) =>
    [...trainingKeys.all, 'list', params] as const,
  marketPreview: () => [...trainingKeys.all, 'market-preview'] as const,
  detail: (id: string) => [...trainingKeys.all, 'detail', id] as const,
  content: (id: string) => [...trainingKeys.all, 'content', id] as const,
  wishlist: () => [...trainingKeys.all, 'wishlist'] as const,
  enrolments: (status?: string) =>
    [...trainingKeys.all, 'enrolments', status ?? 'all'] as const,
  reviews: (id: string) => [...trainingKeys.all, 'reviews', id] as const,
};

export function isApiTrainingId(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/** Market home: first page; UI shows first 2. */
export function useMarketTrainingsPreview() {
  const query = useQuery({
    queryKey: trainingKeys.marketPreview(),
    queryFn: () =>
      trainingService.getList({
        page: 1,
        page_size: 20,
        status: 'published',
      }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const items = useMemo(
    () => mapTrainingsApiToListItems(query.data?.items).slice(0, 2),
    [query.data?.items],
  );

  return {
    ...query,
    items,
  };
}

/** Trainings See all / list screen — published only. */
export function useTrainingsList(params: TrainingListQuery = {}) {
  const queryKeyParams: TrainingListQuery = {
    page: 1,
    page_size: 50,
    ...params,
    status: 'published',
  };

  const query = useQuery({
    queryKey: trainingKeys.list(queryKeyParams),
    queryFn: () => trainingService.getList(queryKeyParams),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const items = useMemo(
    () => mapTrainingsApiToListItems(query.data?.items),
    [query.data?.items],
  );

  return {
    ...query,
    items,
    total: query.data?.pagination.total ?? items.length,
  };
}

/** Training detail — fetches API for UUID ids; static ids skip fetch. */
export function useTraining(id?: string) {
  const enabled = isApiTrainingId(id);

  const query = useQuery<TrainingDetailView, ApiError>({
    queryKey: trainingKeys.detail(id ?? ''),
    queryFn: () => trainingService.getById(id!),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    training: query.data,
    isApiId: enabled,
  };
}

/** GET /api/v1/trainings/{id}/content — enrolled curriculum for progress screen. */
export function useTrainingContent(id?: string) {
  const enabled = isApiTrainingId(id);

  const query = useQuery({
    queryKey: trainingKeys.content(id ?? ''),
    queryFn: () => trainingService.getContent(id!),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const path = useMemo(
    () => (query.data ? mapTrainingContentToProgressPath(query.data) : null),
    [query.data],
  );

  return {
    ...query,
    path,
    content: query.data,
    isApiId: enabled,
  };
}

/** POST /api/v1/trainings/{training_id}/enroll (fallback /enrol). */
export function useEnrollTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      promo_code?: string | null;
      payment_method_id?: string | null;
      form_configuration_version_id?: string | null;
      custom_values?: Record<string, unknown> | null;
    }) =>
      trainingService.enroll(input.id, {
        promo_code: input.promo_code,
        payment_method_id: input.payment_method_id,
        form_configuration_version_id: input.form_configuration_version_id,
        custom_values: input.custom_values,
      }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: trainingKeys.all });
      void queryClient.invalidateQueries({
        queryKey: trainingKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: trainingKeys.enrolments(),
      });
      void queryClient.invalidateQueries({
        queryKey: trainingKeys.wishlist(),
      });
    },
  });
}

function enrolmentTrainingId(item: TrainingEnrolmentApiItem): string | null {
  const id =
    item.training_id ||
    item.training?.id ||
    null;
  return id ? String(id) : null;
}

function isActiveEnrolmentStatus(status?: string | null): boolean {
  const key = (status ?? '').trim().toLowerCase();
  if (!key) return true;
  return (
    key === 'enrolled' ||
    key === 'active' ||
    key === 'completed' ||
    key === 'pending_approval' ||
    key === 'approved'
  );
}

/** GET /api/v1/trainings/my/enrolments */
export function useMyTrainingEnrolments(status?: string) {
  const query = useQuery({
    queryKey: trainingKeys.enrolments(status),
    queryFn: () => trainingService.getMyEnrolments(status),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const enrolledIds = useMemo(() => {
    const set = new Set<string>();
    for (const row of query.data ?? []) {
      if (!isActiveEnrolmentStatus(row.status)) continue;
      const id = enrolmentTrainingId(row);
      if (id) set.add(id);
    }
    return set;
  }, [query.data]);

  return {
    ...query,
    items: query.data ?? [],
    enrolledIds,
    isEnrolled: (trainingId?: string | null) =>
      Boolean(trainingId && enrolledIds.has(trainingId)),
  };
}

/** GET /api/v1/trainings/my/wishlist */
export function useMyTrainingWishlist() {
  const query = useQuery({
    queryKey: trainingKeys.wishlist(),
    queryFn: () => trainingService.getMyWishlist(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const items = useMemo(
    () => (query.data ?? []).map(mapWishlistApiItem),
    [query.data],
  );

  const trainingIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );

  return {
    ...query,
    items,
    trainingIds,
    has: (trainingId?: string | null) =>
      Boolean(trainingId && trainingIds.has(trainingId)),
  };
}

/** POST or DELETE wishlist for a UUID training. */
export function useToggleTrainingWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { trainingId: string; wishlisted: boolean }) => {
      if (input.wishlisted) {
        await trainingService.removeFromWishlist(input.trainingId);
        return { trainingId: input.trainingId, removed: true as const };
      }
      const row = await trainingService.addToWishlist(input.trainingId);
      return { trainingId: input.trainingId, removed: false as const, row };
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: trainingKeys.wishlist() });
      const previous = queryClient.getQueryData<TrainingWishlistApiItem[]>(
        trainingKeys.wishlist(),
      );

      queryClient.setQueryData<TrainingWishlistApiItem[]>(
        trainingKeys.wishlist(),
        (current = []) => {
          if (input.wishlisted) {
            return current.filter(
              (row) =>
                row.training_id !== input.trainingId &&
                row.id !== input.trainingId,
            );
          }
          if (
            current.some(
              (row) =>
                row.training_id === input.trainingId ||
                row.id === input.trainingId,
            )
          ) {
            return current;
          }
          return [
            {
              id: `temp-${input.trainingId}`,
              training_id: input.trainingId,
              title: 'Training',
              added_at: new Date().toISOString(),
            },
            ...current,
          ];
        },
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trainingKeys.wishlist(), context.previous);
      }
    },
    onSuccess: (result) => {
      if (!result.removed && result.row) {
        queryClient.setQueryData<TrainingWishlistApiItem[]>(
          trainingKeys.wishlist(),
          (current = []) => {
            const withoutTemp = current.filter(
              (row) =>
                row.training_id !== result.trainingId &&
                !String(row.id).startsWith('temp-'),
            );
            return [result.row, ...withoutTemp];
          },
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: trainingKeys.wishlist() });
    },
  });
}

/** GET /api/v1/trainings/{id}/reviews */
export function useTrainingReviews(trainingId?: string) {
  const enabled = isApiTrainingId(trainingId);

  const query = useQuery({
    queryKey: trainingKeys.reviews(trainingId ?? ''),
    queryFn: () => trainingService.getReviews(trainingId!),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    reviews: query.data?.reviews ?? [],
    averageRating: query.data?.averageRating ?? null,
    count: query.data?.count ?? 0,
  };
}

/** POST /api/v1/trainings/{id}/reviews */
export function useSubmitTrainingReview(trainingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      rating: number;
      comment: string;
      participant_email: string;
    }) => {
      if (!trainingId) {
        return Promise.reject(new Error('Missing training id'));
      }
      return trainingService.createReview(trainingId, input);
    },
    onSuccess: () => {
      if (!trainingId) return;
      void queryClient.invalidateQueries({
        queryKey: trainingKeys.reviews(trainingId),
      });
      void queryClient.invalidateQueries({
        queryKey: trainingKeys.detail(trainingId),
      });
    },
  });
}
