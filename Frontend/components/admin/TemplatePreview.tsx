'use client';

import InvitationHeader from '../InvitationHeader';
import InvitationCard from '../InvitationCard';
import TimeLocationCard from '../TimeLocationCard';
import ProgramTimeline from '../Timeline';

function PreviewConfirm() {
  return (
    <section className="w-full max-w-[760px] mx-auto">
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md px-5 py-4">
        <div className="font-semibold text-sm text-white/90 text-center">Xác nhận tham dự</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm font-semibold text-white/60"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-[12px]">✓</span>
            Tôi sẽ tham dự
          </button>
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-3 text-sm font-semibold text-white/60"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[12px]">✕</span>
            Không thể tham dự
          </button>
        </div>
      </div>
    </section>
  );
}

export default function TemplatePreview({
  template,
  recipientName,
  recipientTitle,
}: {
  template: {
    company_name: string;
    title: string;
    content: string;
    event_time?: string | null;
    event_location?: string | null;
    google_map_url?: string | null;
    schedule?: { time: string; label: string }[] | null;
  };
  recipientName?: string;
  recipientTitle?: string;
}) {
  const timeText = template.event_time
    ? new Date(template.event_time).toLocaleString('vi-VN')
    : 'Chưa đặt thời gian';

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:p-6">
      <div className="text-sm font-semibold text-white/90 mb-3">Xem trước</div>
      <div className="min-h-[200px] w-full">
        <InvitationHeader
          variant="compact"
          title={template.title || 'Tiêu đề'}
          companyName={template.company_name || 'Company'}
        />
        <div className="w-full max-w-[760px] mx-auto space-y-4">
          <InvitationCard
            recipientTitle={recipientTitle}
            recipientSalutation="Ông"
            recipient={recipientName || 'Tên người nhận'}
            content={template.content || 'Nội dung thư mời...'}
          />
          <TimeLocationCard
            time={timeText}
            location={template.event_location || 'Chưa đặt địa điểm'}
            mapUrl={template.google_map_url || null}
          />
          <PreviewConfirm />
          {template.schedule && template.schedule.length ? (
            <ProgramTimeline schedule={template.schedule} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
