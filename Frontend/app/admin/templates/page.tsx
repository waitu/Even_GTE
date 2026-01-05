'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from 'components/admin/AuthGuard';
import { apiUrl } from 'lib/apiUrl';

interface TemplateItem {
  id: string;
  name: string;
  company_name: string;
  title: string;
  updated_at: string;
}

export default function AdminTemplatesPage() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(apiUrl('/api/templates/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(await res.json());
      }
      setLoading(false);
    };
    run();
  }, []);

  return (
    <AuthGuard>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Mẫu thiệp</h1>
        <Link
          href="/admin/templates/create"
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Tạo mẫu
        </Link>
      </div>

      {loading ? (
        <div className="text-white/70">Đang tải...</div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Tên mẫu</th>
                <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Tiêu đề</th>
                <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Cập nhật</th>
                <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-white/80">{t.title}</td>
                  <td className="p-3 text-white/60">{new Date(t.updated_at).toLocaleString('vi-VN')}</td>
                  <td className="p-3">
                    <Link className="text-gold underline" href={`/admin/templates/${t.id}/edit`}>
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AuthGuard>
  );
}
