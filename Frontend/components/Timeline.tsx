export default function ProgramTimeline({ schedule }: { schedule: { time: string; label: string }[] }) {
  return (
    <section className="w-full max-w-[760px] mx-auto">
      <div className="rounded-2xl bg-zinc-900 border border-white/10 px-5 py-4">
        <div className="font-semibold text-sm text-white/90">Chương trình</div>
        <div className="h-px bg-white/10 my-3" />
        <ul className="space-y-2">
        {schedule.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <span className="bg-white/10 border border-white/10 text-xs px-3 py-1 rounded-lg font-mono min-w-[64px] text-center text-white/90">
              {item.time}
            </span>
            <span className="text-sm text-white/80">{item.label}</span>
          </li>
        ))}
        </ul>
      </div>
    </section>
  );
}
