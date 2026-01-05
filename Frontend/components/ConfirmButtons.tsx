'use client';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from 'lib/apiUrl';

type ConfirmValue = 'ATTENDING' | 'DECLINED';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';').map((p) => p.trim());
  const prefix = `${encodeURIComponent(name)}=`;
  for (const p of parts) {
    if (p.startsWith(prefix)) return decodeURIComponent(p.slice(prefix.length));
  }
  return null;
}

export default function ConfirmButtons({ slug, invitationId }: { slug: string; invitationId: string }) {
  const storageKey = useMemo(() => `invite_confirmed_${invitationId}`, [invitationId]);
  const cookieChoiceKey = useMemo(() => `invite_choice_${invitationId}`, [invitationId]);
  const [confirmed, setConfirmed] = useState<ConfirmValue | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const disabled = loading || (confirmed !== null && !editMode);

  useEffect(() => {
    const syncFromCookie = () => {
      const v = readCookie(cookieChoiceKey);
      if (v === 'ATTENDING' || v === 'DECLINED') {
        setConfirmed(v);
        try {
          localStorage.setItem(storageKey, v);
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    };

    try {
      const saved = localStorage.getItem(storageKey) as ConfirmValue | null;
      if (saved === 'ATTENDING' || saved === 'DECLINED') setConfirmed(saved);
      else syncFromCookie();
    } catch {
      syncFromCookie();
    }
  }, [cookieChoiceKey, storageKey]);

  const handleConfirm = async (value: ConfirmValue) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl(`/api/invitations/${slug}/response`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: value }),
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          setError(typeof err?.detail === 'string' ? err.detail : 'Gửi phản hồi thất bại.');
        } catch {
          setError('Gửi phản hồi thất bại.');
        }
        return;
      }
      setConfirmed(value);
      setEditMode(false);
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  const attendingActive = confirmed === 'ATTENDING';
  const declinedActive = confirmed === 'DECLINED';
  const confirmedLabel = attendingActive ? 'Tôi sẽ tham dự' : declinedActive ? 'Không thể tham dự' : '';

  return (
    <section className="w-full max-w-[760px] mx-auto">
      <div className="rounded-2xl bg-zinc-900 border border-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-[0.22em] uppercase text-amber-200/80">RSVP</div>
            <div className="mt-1 font-semibold text-base text-white/90">Xác nhận tham dự</div>
          </div>
          {confirmed && !editMode ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setEditMode(true);
              }}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white/80"
            >
              Tôi muốn thay đổi tùy chọn
            </button>
          ) : null}
        </div>

        {confirmed && !editMode ? (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            Đã ghi nhận: <span className="font-semibold text-white/90">{confirmedLabel}</span>
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            className={
              'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-60 ' +
              (attendingActive
                ? 'bg-gold text-black border border-gold/50'
                : 'bg-white/10 border border-white/10 text-white/90 hover:bg-white/15')
            }
            disabled={disabled}
            onClick={() => handleConfirm('ATTENDING')}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-[12px]">✓</span>
            Tôi sẽ tham dự
          </button>
          <button
            className={
              'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-60 ' +
              (declinedActive
                ? 'bg-red-500/20 text-red-100 border border-red-500/40'
                : 'bg-white/10 border border-white/10 text-white/80 hover:bg-white/15')
            }
            disabled={disabled}
            onClick={() => handleConfirm('DECLINED')}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[12px]">✕</span>
            Không thể tham dự
          </button>
        </div>
        {loading ? (
          <div className="mt-2 text-center text-xs text-white/60">Đang gửi...</div>
        ) : null}
        {error ? (
          <div className="mt-2 text-center text-xs text-red-200/90">{error}</div>
        ) : null}
        {confirmed && editMode ? (
          <div className="mt-2 text-center text-xs text-white/60">Chọn lại để cập nhật phản hồi.</div>
        ) : null}
      </div>
    </section>
  );
}
