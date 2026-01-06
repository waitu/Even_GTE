'use client';

import { useEffect, useState } from 'react';
import AuthGuard from 'components/admin/AuthGuard';
import { apiUrl } from 'lib/apiUrl';

interface TemplateItem {
  id: string;
  name: string;
}

type ImportResult = {
  created: number;
  skipped: number;
  items: Array<{ row: number; id: string; slug?: string | null }>;
  errors: Array<{ row: number; message: string }>;
};

export default function ImportInvitationsPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateId, setTemplateId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    const run = async () => {
      setTemplatesLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(apiUrl('/api/templates/'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as TemplateItem[];
          setTemplates(data);
          if (data.length) setTemplateId(data[0].id);
        }
      } finally {
        setTemplatesLoading(false);
      }
    };
    run();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (!templateId) {
      setError('Vui lòng chọn mẫu');
      return;
    }
    if (!file) {
      setError('Vui lòng chọn file .xlsx');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const fd = new FormData();
      fd.append('template_id', templateId);
      fd.append('status_value', status);
      fd.append('file', file);

      const res = await fetch(apiUrl('/api/invitations/import'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        try {
          const body = await res.json();
          setError(typeof body?.detail === 'string' ? body.detail : 'Import thất bại');
        } catch {
          setError('Import thất bại');
        }
        return;
      }

      setResult((await res.json()) as ImportResult);
    } catch {
      setError('Không thể kết nối API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Import danh sách (.xlsx)</h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/70">
          File Excel cần có cột: <span className="text-white/90 font-semibold">recipient_name</span>,{' '}
          <span className="text-white/90 font-semibold">recipient_title</span> (bắt buộc),{' '}
          <span className="text-white/90 font-semibold">recipient_salutation</span> (tuỳ chọn).
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm text-white/70">Chọn mẫu</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={templatesLoading || templates.length === 0}
              className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-white/90"
            >
              {templates.length === 0 ? (
                <option value="">Chưa có mẫu</option>
              ) : (
                templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">Trạng thái</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-sm text-white/90"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/70">File .xlsx</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border file:border-white/10 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white/90 hover:file:bg-white/15"
            />
          </label>

          {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:opacity-70"
          >
            {loading ? 'Đang import...' : 'Tạo thiệp từ Excel'}
          </button>

          {result ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm text-white/80">
                Kết quả: <span className="text-white/90 font-semibold">{result.created}</span> tạo thành công,{' '}
                <span className="text-white/90 font-semibold">{result.skipped}</span> dòng trống bỏ qua,{' '}
                <span className="text-white/90 font-semibold">{result.errors.length}</span> lỗi.
              </div>

              {result.errors.length ? (
                <div className="mt-3">
                  <div className="text-sm font-semibold text-white/90 mb-2">Dòng lỗi</div>
                  <div className="space-y-2">
                    {result.errors.slice(0, 20).map((e) => (
                      <div key={`${e.row}-${e.message}`} className="text-sm text-red-200/90">
                        Row {e.row}: {e.message}
                      </div>
                    ))}
                    {result.errors.length > 20 ? (
                      <div className="text-xs text-white/60">(Chỉ hiển thị 20 lỗi đầu tiên)</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
}
