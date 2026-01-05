export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return '';

  if (typeof window === 'undefined') return raw;

  try {
    const url = new URL(raw);
    if (
      window.location.protocol === 'https:' &&
      url.protocol === 'http:' &&
      url.hostname === window.location.hostname
    ) {
      return `https://${url.host}`;
    }
  } catch {
    // If env is not an absolute URL, just use it as-is.
  }

  return raw;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
}
