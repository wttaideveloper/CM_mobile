/** Shared leafy-green gradient used on primary CTAs and headers. */
export const GRADIENT_IDS = {
  leafy: 'leafyGradient',
  leafyButton: 'leafyButtonGradient',
} as const;

/** Diagonal gradient — headers / backgrounds */
export const LEAFY_GRADIENT_VECTOR = {
  x1: '0',
  y1: '0',
  x2: '1',
  y2: '1',
} as const;

export const LEAFY_GRADIENT_STOPS = [
  { offset: '0', color: '#163D34' },
  { offset: '0.42', color: '#1F5D4E' },
  { offset: '0.72', color: '#2B773F' },
  { offset: '1', color: '#4CAF50' },
] as const;

/** Horizontal button gradient colors */
export const LEAFY_BUTTON_GRADIENT_COLORS = [
  '#35624A',
  '#396946',
  '#3E7041',
] as const;

export const LEAFY_BUTTON_GRADIENT_START = { x: 0, y: 0 } as const;

export const LEAFY_BUTTON_GRADIENT_END = { x: 1, y: 0 } as const;

export const LEAFY_GRADIENT_COLORS = {
  start: '#163D34',
  mid: '#1F5D4E',
  leafy: '#2B773F',
  end: '#4CAF50',
  buttonStart: '#35624A',
  buttonMid: '#396946',
  buttonEnd: '#3E7041',
} as const;
