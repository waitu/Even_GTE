import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Web Thiệp Mời</h1>
        <p className="text-sm text-white/70">
          Vào trang quản trị hoặc mở thiệp theo đường dẫn.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
