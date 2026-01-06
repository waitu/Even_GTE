'use client';
import { useEffect, useMemo, useState } from 'react';
import AuthGuard from 'components/admin/AuthGuard';
import { useRouter } from 'next/navigation';
import { apiUrl } from 'lib/apiUrl';

function toDatetimeLocalValue(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ScheduleItem {
  time: string;
  label: string;
}

const DEFAULT_COMPANY_NAME = 'CÔNG TY TNHH CÔNG NGHỆ VÀ DỊCH VỤ GTE';

interface TemplateItem {
  id: string;
  name: string;
  company_name: string;
  title: string;
  content: string;
  event_time?: string | null;
  event_location?: string | null;
  google_map_url?: string | null;
  schedule?: ScheduleItem[] | null;
}

export default function CreateInvitationPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    company_name: DEFAULT_COMPANY_NAME,
    recipient_salutation: 'Ông',
    recipient_name: '',
    recipient_title: '',
    content: '',
    event_time: '',
    event_location: '',
    google_map_url: '',
    schedule: [] as ScheduleItem[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(apiUrl('/api/templates/'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as TemplateItem[];
        setTemplates(data);
        if (data.length) setSelectedTemplateId(data[0].id);
      }
      setTemplatesLoading(false);
    };
    run();
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId],
  );

  const applyTemplate = () => {
    if (!selectedTemplate) return;

    setForm((prev) => {
      const eventTimeLocal = selectedTemplate.event_time
        ? toDatetimeLocalValue(selectedTemplate.event_time)
        : '';

      return {
        ...prev,
        company_name: selectedTemplate.company_name || DEFAULT_COMPANY_NAME,
        title: selectedTemplate.title,
        content: selectedTemplate.content,
        event_time: eventTimeLocal || prev.event_time,
        event_location: selectedTemplate.event_location ?? prev.event_location,
        google_map_url: selectedTemplate.google_map_url ?? prev.google_map_url,
        schedule: (selectedTemplate.schedule ?? []) as ScheduleItem[],
      };
    });
  };

  const handleScheduleChange = (idx: number, field: keyof ScheduleItem, value: string) => {
    const schedule = [...form.schedule];
    schedule[idx][field] = value;
    setForm({ ...form, schedule });
  };

  const addScheduleRow = () => {
    setForm({ ...form, schedule: [...form.schedule, { time: '', label: '' }] });
  };

  const removeScheduleRow = (idx: number) => {
    setForm({ ...form, schedule: form.schedule.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (publish = false) => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(apiUrl('/api/invitations/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, status: publish ? 'published' : 'draft' }),
      });
      if (res.ok) {
        router.push('/admin/invitations');
      } else {
        setError('Lỗi lưu thiệp');
      }
    } catch {
      setError('Không thể kết nối API');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <form className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <h1 className="text-lg font-semibold">Tạo thiệp mời</h1>

        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Chọn mẫu</div>
          <div className="text-xs text-white/60">
            Mẫu được quản lý trong Dashboard (thêm/sửa/xóa). Chọn mẫu rồi bấm “Áp dụng mẫu”.
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={templatesLoading || templates.length === 0}
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
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60"
              onClick={applyTemplate}
              disabled={!selectedTemplate}
            >
              Áp dụng mẫu
            </button>
          </div>
        </div>

        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="title" placeholder="Tiêu đề" value={form.title} onChange={handleChange} required />
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="company_name" placeholder="Công ty" value={form.company_name} onChange={handleChange} required />
        <select
          className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none"
          name="recipient_salutation"
          value={form.recipient_salutation}
          onChange={(e) => setForm({ ...form, recipient_salutation: e.target.value })}
        >
          <option value="Ông">Ông</option>
          <option value="Bà">Bà</option>
          <option value="Mr">Mr</option>
          <option value="Ms">Ms</option>
        </select>
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="recipient_title" placeholder="Chức danh / Chức vụ (vd: Giám đốc)" value={form.recipient_title} onChange={handleChange} required />
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="recipient_name" placeholder="Tên người nhận" value={form.recipient_name} onChange={handleChange} required />
        <textarea className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none min-h-[120px]" name="content" placeholder="Nội dung" value={form.content} onChange={handleChange} required />
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="event_time" type="datetime-local" placeholder="Thời gian" value={form.event_time} onChange={handleChange} required />
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="event_location" placeholder="Địa điểm" value={form.event_location} onChange={handleChange} required />
        <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="google_map_url" placeholder="Google Map URL" value={form.google_map_url} onChange={handleChange} />
        <div>
          <div className="font-semibold mb-2">Chương trình</div>
          {form.schedule.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 w-24 outline-none"
                placeholder="Giờ"
                value={item.time}
                onChange={e => handleScheduleChange(idx, 'time', e.target.value)}
                required
              />
              <input
                className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 flex-1 outline-none"
                placeholder="Nội dung"
                value={item.label}
                onChange={e => handleScheduleChange(idx, 'label', e.target.value)}
                required
              />
              <button type="button" className="px-3 rounded-xl bg-white/10 border border-white/10" onClick={() => removeScheduleRow(idx)}>-</button>
            </div>
          ))}
          <button type="button" className="text-gold underline" onClick={addScheduleRow}>+ Thêm dòng</button>
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10" disabled={saving}>Lưu nháp</button>
          <button type="button" className="px-4 py-2 rounded-full bg-gold text-black font-semibold" disabled={saving} onClick={() => handleSubmit(true)}>Xuất bản</button>
        </div>
      </form>
    </AuthGuard>
  );
}
