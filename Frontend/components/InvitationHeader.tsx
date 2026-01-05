export default function InvitationHeader({
  title,
  companyName,
  variant = 'hero',
}: {
  title: string;
  companyName: string;
  variant?: 'hero' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <header className="w-full max-w-[760px] mx-auto pt-8 pb-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black">
          <div
            aria-hidden
            className="absolute inset-0 bg-no-repeat bg-top bg-contain opacity-70"
            style={{ backgroundImage: "url('/year-end-hero.png')" }}
          />
          <div aria-hidden className="absolute inset-0 bg-black/45" />

          <div className="relative px-6 pt-6 pb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-9 h-9" />
              <div className="text-sm font-semibold text-white/90">
                {companyName || 'Technology Company'}
              </div>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-semibold text-white tracking-tight">
              <span className="drop-shadow-[0_0_18px_rgba(99,102,241,0.55)]">{title}</span>
            </h1>

            <div className="mt-4 h-px w-24 mx-auto bg-white/15" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <section className="relative w-screen h-[55vh] min-h-[420px] sm:h-[60vh] sm:min-h-[480px] lg:h-[70vh] lg:min-h-[520px] overflow-hidden bg-transparent">
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0 bg-no-repeat bg-top bg-contain"
          style={{
            backgroundImage: "url('/year-end-hero.png')",
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>
    </section>
  );
}
