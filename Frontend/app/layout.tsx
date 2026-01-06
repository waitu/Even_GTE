import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thiệp Mời',
  description: 'Trang xác nhận tham dự sự kiện',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className="relative bg-black text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(
                  80% 60% at 50% 23%,
                  rgba(251,191,36,0.07) 30%,
                  rgba(18,16,32,0.93) 50%,
                  rgba(44, 36, 36, 1) 100%
                )
                `,
            }}
          />
        </div>

        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
