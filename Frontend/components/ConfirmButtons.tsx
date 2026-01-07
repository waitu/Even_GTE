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

export default function ConfirmButtons({
  slug,
  invitationId,
  initialConfirmed,
  initialAttendeeCount,
}: {
  slug: string;
  invitationId: string;
  initialConfirmed?: ConfirmValue | null;
  initialAttendeeCount?: number;
}) {
  const storageKey = useMemo(() => `invite_confirmed_${invitationId}`, [invitationId]);
  const countStorageKey = useMemo(() => `invite_attendees_${invitationId}`, [invitationId]);
  const cookieChoiceKey = useMemo(() => `invite_choice_${invitationId}`, [invitationId]);
  const [confirmed, setConfirmed] = useState<ConfirmValue | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number>(1);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAttendModal, setShowAttendModal] = useState(false);
  const disabled = loading || (confirmed !== null && !editMode);

  useEffect(() => {
    if (initialConfirmed === 'ATTENDING' || initialConfirmed === 'DECLINED') {
      setConfirmed(initialConfirmed);
      if (initialConfirmed === 'ATTENDING') {
        const n = typeof initialAttendeeCount === 'number' ? initialAttendeeCount : 1;
        setAttendeeCount(Math.max(1, Math.min(20, Math.trunc(n || 1))));
      }
    }

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

      const countSaved = localStorage.getItem(countStorageKey);
      const parsed = countSaved ? Number(countSaved) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) {
        setAttendeeCount(Math.max(1, Math.min(20, Math.trunc(parsed))));
      }
    } catch {
      syncFromCookie();
    }
  }, [cookieChoiceKey, storageKey, countStorageKey, initialAttendeeCount, initialConfirmed]);

  const handleConfirm = async (value: ConfirmValue) => {
    setLoading(true);
    setError('');
    try {
      const body: { response: ConfirmValue; attendee_count?: number } = { response: value };
      if (value === 'ATTENDING') body.attendee_count = attendeeCount;
      const res = await fetch(apiUrl(`/api/invitations/${slug}/response`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
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
      if (value === 'DECLINED') setAttendeeCount(0);
      setEditMode(false);
      setShowAttendModal(false);
      try {
        localStorage.setItem(storageKey, value);
        if (value === 'ATTENDING') localStorage.setItem(countStorageKey, String(attendeeCount));
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
            Đã ghi nhận:{' '}
            <span className="font-semibold text-white/90">
              {confirmedLabel}
              {attendingActive ? ` (${Math.max(1, attendeeCount)} người)` : ''}
            </span>
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
            onClick={() => {
              setError('');
              if (disabled) return;
              setAttendeeCount(attendeeCount > 0 ? attendeeCount : 1);
              setShowAttendModal(true);
            }}
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

        {showAttendModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                if (!loading) setShowAttendModal(false);
              }}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-5">
              <div className="text-xs font-semibold tracking-[0.22em] uppercase text-amber-200/80">Xác nhận</div>
              <div className="mt-1 font-semibold text-base text-white/90">Bạn sẽ tham dự với bao nhiêu người?</div>
              <div className="mt-1 text-sm text-white/70">Giúp ban tổ chức sắp xếp bàn tiệc phù hợp.</div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  disabled={loading}
                  className={
                    'w-full rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ' +
                    (attendeeCount === 1
                      ? 'bg-gold text-black border-gold/50'
                      : 'bg-white/10 border-white/10 text-white/90 hover:bg-white/15')
                  }
                  onClick={() => setAttendeeCount(1)}
                >
                  Chỉ mình tôi (1 người)
                </button>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white/90">Tôi đi cùng</div>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={attendeeCount}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        setAttendeeCount(Math.max(1, Math.min(20, Math.trunc(n))));
                      }}
                      className="w-24 rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none text-white/90"
                    />
                    <div className="text-sm text-white/70">người</div>
                  </div>
                  <div className="mt-2 text-xs text-white/60">Tối đa 20 người.</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 disabled:opacity-60"
                    onClick={() => setShowAttendModal(false)}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded-xl border border-gold/50 bg-gold text-black px-4 py-3 text-sm font-semibold disabled:opacity-60"
                    onClick={() => handleConfirm('ATTENDING')}
                  >
                    Xác nhận tham dự
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
