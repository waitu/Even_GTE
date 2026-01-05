export default function InvitationCard({
  recipientTitle,
  recipientSalutation,
  recipient,
  content,
}: {
  recipientTitle?: string;
  recipientSalutation?: string;
  recipient: string;
  content: string;
}) {
  const salutationText = recipientSalutation && recipientSalutation.trim() ? recipientSalutation.trim() : 'Ông';

  return (
    <section className="w-full max-w-[760px] mx-auto">
      <div className="rounded-2xl bg-zinc-900 border border-white/10 px-5 py-5">
        <div className="text-sm text-white/70">
          Kính gửi {salutationText} {recipient},
        </div>
        <div className="mt-3 text-sm text-white/85 leading-relaxed whitespace-pre-line">
          {content}
        </div>
        <div className="mt-4 text-sm text-white/70">
          Trân trọng,
          <br />
          Ban tổ chức
        </div>
      </div>
    </section>
  );
}
