import { notFound } from 'next/navigation';
import InvitationHeader from '../../../components/InvitationHeader';
import InvitationCard from '../../../components/InvitationCard';
import TimeLocationCard from '../../../components/TimeLocationCard';
import ConfirmButtons from '../../../components/ConfirmButtons';
import ProgramTimeline from '../../../components/Timeline';
import { fetchInvitation } from '../../../lib/fetchInvitation';

export default async function InvitationPage({ params }: { params: { slug: string } }) {
  const invitation = await fetchInvitation(params.slug);
  if (!invitation) return notFound();

  const salutation = invitation.recipient_salutation || 'Ông';

  return (
    <div className="min-h-screen w-full font-sans">

      <InvitationHeader title={invitation.title} companyName={invitation.company_name} />

      <div className="relative -mt-[29vh] sm:-mt-[14vh] lg:-mt-36 z-10">
        <div className="relative w-full max-w-[980px] mx-auto px-4 md:px-10 pt-10 pb-14">
          <div className="w-full max-w-[760px] mx-auto space-y-4">
            <div className="rounded-2xl p-5 md:p-6">
              <div className="flex justify-center">
                <div className="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-3">
                  <div className="col-start-2 row-start-1 text-center">
                    <div className="text-xs font-semibold tracking-[0.22em] uppercase text-amber-200/90">
                      {invitation.company_name}
                    </div>
                  </div>
                  <div className="col-span-2 row-start-2 flex items-center justify-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-14 h-auto object-contain"
                    />

                    <div className="text-2xl md:text-3xl font-semibold text-amber-100 tracking-tight">
                      {invitation.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-1 rounded-full bg-gradient-to-b from-transparent via-amber-200/25 to-amber-200/60" />
                <div>
                  <div className="text-sm text-white/60">Kính gửi</div>
                  <div className="text-xl md:text-2xl font-semibold text-white">
                    {salutation} {invitation.recipient_name}
                  </div>
                  {invitation.recipient_title ? (
                    <div className="text-xs text-white/50">{invitation.recipient_title}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <InvitationCard
              recipientTitle={invitation.recipient_title}
              recipientSalutation={invitation.recipient_salutation}
              recipient={invitation.recipient_name}
              content={invitation.content}
            />

            <TimeLocationCard
              time={new Date(invitation.event_time).toLocaleString('vi-VN')}
              location={invitation.event_location}
              mapUrl={invitation.google_map_url}
            />

            <ConfirmButtons
              slug={params.slug}
              invitationId={invitation.id}
              initialConfirmed={invitation.rsvp_status === 'ATTENDING' || invitation.rsvp_status === 'DECLINED' ? invitation.rsvp_status : null}
              initialAttendeeCount={typeof invitation.attendee_count === 'number' ? invitation.attendee_count : 0}
            />

            {invitation.schedule && invitation.schedule.length > 0 ? (
              <ProgramTimeline schedule={invitation.schedule} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
