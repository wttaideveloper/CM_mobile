import { PixelRatio } from 'react-native';

/** Build a sharp Unsplash URL sized for the device pixel ratio. */
export function hdUnsplash(photoId: string, width: number, height: number) {
  const scale = Math.max(PixelRatio.get(), 2);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=90`;
}
