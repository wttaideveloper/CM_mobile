import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';

import { useAuthStore } from '@/stores/auth.store';

export type TrainingDownloadKind = 'video' | 'document';

export type TrainingDownloadItem = {
  /** Stable key: `${trainingId}:${lessonId}` (unique per user via userId) */
  id: string;
  userId: string;
  trainingId: string;
  trainingTitle: string;
  lessonId: string;
  lessonTitle: string;
  kind: TrainingDownloadKind;
  remoteUrl: string;
  localUri: string;
  fileName: string;
  downloadedAt: string;
};

type TrainingDownloadsState = {
  hydrated: boolean;
  /** All users' downloads on this device (filter by userId when showing). */
  items: TrainingDownloadItem[];
  hydrate: () => Promise<void>;
  upsert: (item: TrainingDownloadItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  has: (trainingId: string, lessonId: string) => boolean;
  getByLesson: (
    trainingId: string,
    lessonId: string,
  ) => TrainingDownloadItem | undefined;
  itemsForUser: (userId?: string | null) => TrainingDownloadItem[];
};

const LIBRARY_DIR = `${FileSystem.documentDirectory ?? ''}training-downloads/`;
const INDEX_PATH = `${LIBRARY_DIR}index.json`;

export function trainingDownloadId(
  trainingId: string,
  lessonId: string,
): string {
  return `${trainingId}:${lessonId}`;
}

function currentUserId(): string | null {
  const id = useAuthStore.getState().user?.id?.trim();
  return id || null;
}

function matchesUser(
  item: TrainingDownloadItem,
  userId: string | null | undefined,
): boolean {
  if (!userId) return false;
  return item.userId === userId;
}

export async function ensureTrainingDownloadsDir(): Promise<string> {
  const info = await FileSystem.getInfoAsync(LIBRARY_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(LIBRARY_DIR, { intermediates: true });
  }
  return LIBRARY_DIR;
}

async function readIndex(): Promise<TrainingDownloadItem[]> {
  try {
    const info = await FileSystem.getInfoAsync(INDEX_PATH);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(INDEX_PATH);
    const parsed = JSON.parse(raw) as TrainingDownloadItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row) =>
        row &&
        typeof row.id === 'string' &&
        typeof row.localUri === 'string' &&
        typeof row.trainingId === 'string' &&
        typeof row.lessonId === 'string' &&
        typeof row.userId === 'string' &&
        row.userId.trim().length > 0,
    );
  } catch {
    return [];
  }
}

async function writeIndex(items: TrainingDownloadItem[]): Promise<void> {
  await ensureTrainingDownloadsDir();
  await FileSystem.writeAsStringAsync(INDEX_PATH, JSON.stringify(items));
}

async function pruneMissingFiles(
  items: TrainingDownloadItem[],
): Promise<TrainingDownloadItem[]> {
  const kept: TrainingDownloadItem[] = [];
  for (const item of items) {
    try {
      const info = await FileSystem.getInfoAsync(item.localUri);
      if (info.exists) kept.push(item);
    } catch {
      /* drop */
    }
  }
  return kept;
}

export const useTrainingDownloadsStore = create<TrainingDownloadsState>(
  (set, get) => ({
    hydrated: false,
    items: [],

    hydrate: async () => {
      await ensureTrainingDownloadsDir();
      const raw = await readIndex();
      const items = await pruneMissingFiles(raw);
      if (items.length !== raw.length) {
        await writeIndex(items);
      }
      set({ items, hydrated: true });
    },

    upsert: async (item) => {
      const userId = item.userId?.trim() || currentUserId();
      if (!userId) return;
      const nextItem: TrainingDownloadItem = { ...item, userId };
      const without = get().items.filter(
        (row) => !(row.userId === userId && row.id === nextItem.id),
      );
      const items = [nextItem, ...without];
      set({ items, hydrated: true });
      await writeIndex(items);
    },

    remove: async (id) => {
      const userId = currentUserId();
      const existing = get().items.find(
        (row) => row.id === id && matchesUser(row, userId),
      );
      if (!existing) return;
      const items = get().items.filter((row) => row !== existing);
      set({ items });
      await writeIndex(items);
      if (existing.localUri) {
        try {
          const info = await FileSystem.getInfoAsync(existing.localUri);
          if (info.exists) {
            await FileSystem.deleteAsync(existing.localUri, {
              idempotent: true,
            });
          }
        } catch {
          /* ignore */
        }
      }
    },

    itemsForUser: (userId) => {
      const uid = userId?.trim() || currentUserId();
      if (!uid) return [];
      return get().items.filter((row) => matchesUser(row, uid));
    },

    has: (trainingId, lessonId) => {
      const userId = currentUserId();
      if (!userId) return false;
      const key = trainingDownloadId(trainingId, lessonId);
      return get().items.some(
        (row) =>
          matchesUser(row, userId) &&
          (row.id === key ||
            (row.trainingId === trainingId && row.lessonId === lessonId)),
      );
    },

    getByLesson: (trainingId, lessonId) => {
      const userId = currentUserId();
      if (!userId) return undefined;
      const key = trainingDownloadId(trainingId, lessonId);
      return get().items.find(
        (row) =>
          matchesUser(row, userId) &&
          (row.id === key ||
            (row.trainingId === trainingId && row.lessonId === lessonId)),
      );
    },
  }),
);
