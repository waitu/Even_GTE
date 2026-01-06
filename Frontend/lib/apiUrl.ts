export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return '';

  if (typeof window === 'undefined') return raw;

  try {
    const url = new URL(raw);
    // If the site is served over HTTPS and the API host matches the current host,
    // always prefer a relative URL (e.g. /api/...) to avoid Mixed Content and
    // avoid accidentally hard-coding an HTTP origin or port.
    if (window.location.protocol === 'https:' && url.hostname === window.location.hostname) {
      return '';
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
