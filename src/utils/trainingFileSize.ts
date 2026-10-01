/**
 * Format API `file_size` / `size` values (bytes as string/number, or already
 * human labels like "35 KB") for Notes and curriculum UI.
 */
export function formatTrainingFileSize(
  raw: string | number | null | undefined,
): string {
  if (raw == null) return '';
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return '';
    return bytesToLabel(raw);
  }

  const value = raw.trim();
  if (!value || value === '—' || value === '-') return '';

  // Already human-readable (e.g. "35 KB", "1.2 MB").
  if (/^\d+(\.\d+)?\s*[kmgt]?b$/i.test(value)) {
    return value.replace(/\s+/g, ' ').toUpperCase().replace(/B$/i, 'B');
  }
  if (/^\d+(\.\d+)?\s*(kb|mb|gb|tb)$/i.test(value)) {
    const match = value.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|gb|tb)$/i);
    if (match) return `${match[1]} ${match[2]!.toUpperCase()}`;
  }

  const asNumber = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(asNumber) || asNumber < 0) return value;
  return bytesToLabel(asNumber);
}

function bytesToLabel(bytes: number): string {
  if (bytes < 1024) return `${Math.max(0, Math.round(bytes))} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb >= 10 ? Math.round(kb) : Math.round(kb * 10) / 10} KB`;
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }
  const gb = mb / 1024;
  return `${gb >= 10 ? Math.round(gb) : Math.round(gb * 10) / 10} GB`;
}
