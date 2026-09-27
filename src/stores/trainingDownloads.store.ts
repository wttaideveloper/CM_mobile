import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';

export type TrainingDownloadKind = 'video' | 'document';

export type TrainingDownloadItem = {
  /** Stable key: `${trainingId}:${lessonId}` */
  id: string;
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
  items: TrainingDownloadItem[];
  hydrate: () => Promise<void>;
  upsert: (item: TrainingDownloadItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  has: (trainingId: string, lessonId: string) => boolean;
  getByLesson: (
    trainingId: string,
    lessonId: string,
  ) => TrainingDownloadItem | undefined;
};

const LIBRARY_DIR = `${FileSystem.documentDirectory ?? ''}training-downloads/`;
const INDEX_PATH = `${LIBRARY_DIR}index.json`;

export function trainingDownloadId(
  trainingId: string,
  lessonId: string,
): string {
  return `${trainingId}:${lessonId}`;
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
        typeof row.lessonId === 'string',
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
      const without = get().items.filter((row) => row.id !== item.id);
      const items = [item, ...without];
      set({ items, hydrated: true });
      await writeIndex(items);
    },

    remove: async (id) => {
      const existing = get().items.find((row) => row.id === id);
      const items = get().items.filter((row) => row.id !== id);
      set({ items });
      await writeIndex(items);
      if (existing?.localUri) {
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

    has: (trainingId, lessonId) =>
      get().items.some(
        (row) =>
          row.id === trainingDownloadId(trainingId, lessonId) ||
          (row.trainingId === trainingId && row.lessonId === lessonId),
      ),

    getByLesson: (trainingId, lessonId) =>
      get().items.find(
        (row) =>
          row.id === trainingDownloadId(trainingId, lessonId) ||
          (row.trainingId === trainingId && row.lessonId === lessonId),
      ),
  }),
);
