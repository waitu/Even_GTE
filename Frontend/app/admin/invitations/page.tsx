'use client';
import { useEffect, useState } from 'react';
import AuthGuard from 'components/admin/AuthGuard';
import Link from 'next/link';
import { apiUrl } from 'lib/apiUrl';

interface Invitation {
  id: string;
  title: string;
  recipient_salutation?: string | null;
  recipient_name: string;
  recipient_title?: string | null;
  status: string;
  rsvp_status?: 'ATTENDING' | 'DECLINED' | 'PENDING';
  slug?: string;
  responses?: number;
  attending?: number;
  declined?: number;
}

function RsvpBadge({ value }: { value?: Invitation['rsvp_status'] }) {
  const v = value ?? 'PENDING';
  const common = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs border';
  if (v === 'ATTENDING') {
    return <span className={`${common} bg-gold/10 text-gold border-gold/30`}>ATTENDING</span>;
  }
  if (v === 'DECLINED') {
    return <span className={`${common} bg-red-500/10 text-red-300 border-red-500/30`}>DECLINED</span>;
  }
  return <span className={`${common} bg-white/5 text-white/70 border-white/10`}>PENDING</span>;
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ATTENDING' | 'DECLINED' | 'PENDING'>('ALL');

  const handleDelete = async (inv: Invitation) => {
    const ok = window.confirm(`Xóa thiệp mời "${inv.title}"?`);
    if (!ok) return;

    const token = localStorage.getItem('admin_token');
    const res = await fetch(apiUrl(`/api/invitations/${inv.id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setInvitations((prev) => prev.filter((x) => x.id !== inv.id));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(apiUrl('/api/invitations'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInvitations(await res.json());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    total: invitations.length,
    attending: invitations.filter((x) => (x.rsvp_status ?? 'PENDING') === 'ATTENDING').length,
    declined: invitations.filter((x) => (x.rsvp_status ?? 'PENDING') === 'DECLINED').length,
    pending: invitations.filter((x) => (x.rsvp_status ?? 'PENDING') === 'PENDING').length,
  };

  const filtered = filter === 'ALL' ? invitations : invitations.filter((x) => (x.rsvp_status ?? 'PENDING') === filter);

  return (
    <AuthGuard>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Danh sách thiệp mời</h1>
        <Link
          href="/admin/invitations/create"
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Tạo mới
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span className="text-white/70">Tổng:</span> <span className="text-white/90 font-semibold">{stats.total}</span>
          <span className="mx-3 text-white/20">|</span>
          <span className="text-white/70">ATTENDING:</span> <span className="text-white/90 font-semibold">{stats.attending}</span>
          <span className="mx-3 text-white/20">|</span>
          <span className="text-white/70">DECLINED:</span> <span className="text-white/90 font-semibold">{stats.declined}</span>
          <span className="mx-3 text-white/20">|</span>
          <span className="text-white/70">PENDING:</span> <span className="text-white/90 font-semibold">{stats.pending}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-white/70" htmlFor="rsvpFilter">Lọc RSVP</label>
          <select
            id="rsvpFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-white/90"
          >
            <option value="ALL">Tất cả</option>
            <option value="ATTENDING">ATTENDING</option>
            <option value="DECLINED">DECLINED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-white/70">Đang tải...</div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Tiêu đề</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Người nhận</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Chức danh</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Trạng thái</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">RSVP</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Xác nhận</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Link</th>
              <th className="p-3 text-left bg-white/5 text-white/80 font-semibold whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-t border-white/10">
                <td className="p-3">{inv.title}</td>
                <td className="p-3 text-white/80">
                  {(inv.recipient_salutation ? `${inv.recipient_salutation} ` : '') + inv.recipient_name}
                </td>
                <td className="p-3 text-white/70">{inv.recipient_title || '-'}</td>
                <td className="p-3 text-white/80">{inv.status}</td>
                <td className="p-3"><RsvpBadge value={inv.rsvp_status} /></td>
                <td className="p-3 text-white/80">{inv.responses ?? 0}</td>
                <td className="p-3">
                  {inv.slug ? (
                    <a href={`/invite/${inv.slug}`} target="_blank" className="text-gold underline">Xem</a>
                  ) : (
                    <span className="text-white/40">-</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(inv)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
                  >
                    Xóa
                  </button>
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
