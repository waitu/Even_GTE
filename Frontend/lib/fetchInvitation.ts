export async function fetchInvitation(slug: string) {
  try {
      const { apiUrl } = await import('lib/apiUrl');
      const res = await fetch(apiUrl(`/api/invitations/${slug}`), {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
