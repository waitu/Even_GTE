/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeAdminToken } from '../../lib/admin/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    removeAdminToken();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {isLoginPage ? null : (
        <nav className="sticky top-0 z-20 bg-black/70 backdrop-blur border-b border-white/10">
          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 sm:gap-4">
            <Link href="/admin/invitations" className="font-semibold tracking-wide">
              Thiệp mời
            </Link>
            <Link
              href="/admin/invitations/create"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Tạo thiệp
            </Link>
            <Link
              href="/admin/templates"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Mẫu
            </Link>
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-white/70 hover:text-white"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">{children}</main>
    </div>
  );
}
