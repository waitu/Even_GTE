'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from 'lib/apiUrl';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.access_token);
        router.push('/admin/invitations');
      } else {
        setError('Sai tài khoản hoặc mật khẩu');
      }
    } catch {
      setError('Không thể kết nối API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur px-6 py-7 shadow-black/20">
          <div className="mb-6">
            <div className="text-xs font-semibold tracking-widest text-white/60">ADMIN</div>
            <h1 className="mt-1 text-2xl font-semibold text-white">Đăng nhập</h1>
            <p className="mt-1 text-sm text-white/60">Chỉ dành cho quản trị viên hệ thống.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Tài khoản</span>
              <input
                className="rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3 text-white/90 placeholder:text-white/35 outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/15"
                placeholder="vd: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Mật khẩu</span>
              <input
                className="rounded-xl bg-zinc-950/60 border border-white/10 px-4 py-3 text-white/90 placeholder:text-white/35 outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/15"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
