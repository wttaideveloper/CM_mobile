import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { workflowService } from '@/services/workflow.service';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import type { WorkflowItem } from '@/types/workflow.types';
import { getPublishedCheckoutWorkflow } from '@/utils/workflowCheckout.utils';

export const workflowKeys = {
  all: ['workflows'] as const,
  published: () => [...workflowKeys.all, 'published'] as const,
};

type UsePublishedWorkflowOptions = Omit<
  UseQueryOptions<WorkflowItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function usePublishedWorkflows(options?: UsePublishedWorkflowOptions) {
  const tenantAccessToken = useAuthStore((state) => state.tenantAccessToken);

  const query = useQuery<WorkflowItem[], ApiError>({
    queryKey: workflowKeys.published(),
    queryFn: workflowService.listPublished,
    enabled: Boolean(tenantAccessToken),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  return {
    ...query,
    workflows: query.data ?? [],
    checkoutWorkflow: getPublishedCheckoutWorkflow(query.data),
  };
}
