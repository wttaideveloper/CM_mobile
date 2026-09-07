import type { ChatMode } from '@/constants/chat';

export function paramValue(value?: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function parseMode(value: string): ChatMode {
  if (value === 'full' || value === 'readonly') return value;
  return 'preview';
}
