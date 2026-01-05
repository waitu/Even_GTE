export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
}
