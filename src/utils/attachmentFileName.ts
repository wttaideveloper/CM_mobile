/**
 * Backend sometimes returns URL-encoded names (e.g. `Flow%20(1).pdf`).
 * Decode for display, download Save As, and share sheet.
 */
export function decodeAttachmentFileName(fileName: string | null | undefined): string {
  let current = (fileName ?? '').trim();
  if (!current) return current;

  // Handle single- or double-encoded values from the API.
  for (let i = 0; i < 3; i += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(current)) break;
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }

  return current;
}

/** Safe name for writing to disk (decodes first, then strips illegal path chars). */
export function sanitizeAttachmentFileName(fileName: string | null | undefined): string {
  const cleaned = decodeAttachmentFileName(fileName)
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  return cleaned || `attachment-${Date.now()}`;
}
