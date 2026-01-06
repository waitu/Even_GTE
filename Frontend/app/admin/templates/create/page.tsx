'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from 'components/admin/AuthGuard';
import TemplatePreview from 'components/admin/TemplatePreview';
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

export default function CreateTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [recipientName, setRecipientName] = useState('Bùi Hiếu');
  const [recipientTitle, setRecipientTitle] = useState('Mr');

  const [form, setForm] = useState({
    name: 'GTE - Year End',
    company_name: DEFAULT_COMPANY_NAME,
    title: 'Lễ tổng kết cuối năm',
    content:
      'Trân trọng mời anh/chị tham dự sự kiện YEAR END PARTY.\nSự hiện diện của anh/chị sẽ là niềm vinh dự lớn của chúng tôi.\n\nTrân trọng,\nBan tổ chức',
    event_time: '',
    event_location: '',
    google_map_url: '',
    schedule: [
      { time: '18:00', label: 'Đón khách & Check-in' },
      { time: '19:00', label: 'Khai mạc' },
      { time: '19:30', label: 'Nhập tiệc' },
    ] as ScheduleItem[],
  });

  const previewPayload = useMemo(() => {
    return {
      company_name: form.company_name,
      title: form.title,
      content: form.content,
      event_time: form.event_time ? toDatetimeLocalValue(form.event_time) : null,
      event_location: form.event_location || null,
      google_map_url: form.google_map_url || null,
      schedule: form.schedule,
    };
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    const payload = {
      name: form.name,
      company_name: form.company_name,
      title: form.title,
      content: form.content,
      event_time: form.event_time || null,
      event_location: form.event_location || null,
      google_map_url: form.google_map_url || null,
      schedule: form.schedule,
    };

    const res = await fetch(apiUrl('/api/templates/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin/templates');
    } else {
      setError('Lỗi tạo mẫu');
    }
    setSaving(false);
  };

  return (
    <AuthGuard>
      <div className="grid gap-4">
        <form
          className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <h1 className="text-lg font-semibold">Tạo mẫu thiệp</h1>

          <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="name" placeholder="Tên mẫu" value={form.name} onChange={handleChange} required />
          <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="company_name" placeholder="Công ty" value={form.company_name} onChange={handleChange} required />
          <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="title" placeholder="Tiêu đề" value={form.title} onChange={handleChange} required />
          <textarea className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none min-h-[140px]" name="content" placeholder="Nội dung" value={form.content} onChange={handleChange} required />

          <div className="grid md:grid-cols-2 gap-3">
            <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="event_time" type="datetime-local" value={form.event_time} onChange={handleChange} />
            <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="event_location" placeholder="Địa điểm" value={form.event_location} onChange={handleChange} />
          </div>
          <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" name="google_map_url" placeholder="Google Map URL" value={form.google_map_url} onChange={handleChange} />

          <div>
            <div className="font-semibold mb-2">Chương trình</div>
            {form.schedule.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 w-24 outline-none"
                  placeholder="Giờ"
                  value={item.time}
                  onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)}
                  required
                />
                <input
                  className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 flex-1 outline-none"
                  placeholder="Nội dung"
                  value={item.label}
                  onChange={(e) => handleScheduleChange(idx, 'label', e.target.value)}
                  required
                />
                <button type="button" className="px-3 rounded-xl bg-white/10 border border-white/10" onClick={() => removeScheduleRow(idx)}>
                  -
                </button>
              </div>
            ))}
            <button type="button" className="text-gold underline" onClick={addScheduleRow}>
              + Thêm dòng
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">Preview data</div>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" value={recipientTitle} onChange={(e) => setRecipientTitle(e.target.value)} placeholder="Chức danh (preview)" />
              <input className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Tên người nhận (preview)" />
            </div>
          </div>

          {error ? <div className="text-red-400 text-sm">{error}</div> : null}

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-full bg-gold text-black font-semibold" disabled={saving}>
              Lưu mẫu
            </button>
            <button type="button" className="px-4 py-2 rounded-full bg-white/10 border border-white/10" onClick={() => router.push('/admin/templates')}>
              Hủy
            </button>
          </div>
        </form>

        <TemplatePreview template={previewPayload} recipientName={recipientName} recipientTitle={recipientTitle} />
      </div>
    </AuthGuard>
  );
}
