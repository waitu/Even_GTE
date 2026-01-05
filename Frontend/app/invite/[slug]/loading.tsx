export default function LoadingInvite() {
  return (
    <div className="min-h-screen w-full bg-black font-sans">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
        <div className="absolute -top-40 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-24 left-1/4 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-2/3 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.14),transparent_45%)]" />
      </div>

      <div className="relative w-full max-w-[980px] mx-auto px-4 md:px-10 pb-14">
        <div className="w-full max-w-[760px] mx-auto pt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 animate-pulse" />
            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="mt-5 h-9 md:h-12 w-3/4 mx-auto bg-white/10 rounded animate-pulse" />
          <div className="mt-4 text-white/70 text-sm">Đang tải thiệp mời...</div>
        </div>

        <div className="w-full max-w-[760px] mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md px-5 py-5 animate-pulse">
              <div className="h-4 w-40 bg-white/10 rounded" />
              <div className="mt-3 h-3 w-3/4 bg-white/10 rounded" />
              <div className="mt-2 h-3 w-2/3 bg-white/10 rounded" />
              <div className="mt-2 h-3 w-1/2 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
