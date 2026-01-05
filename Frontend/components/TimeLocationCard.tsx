function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/70">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/70">
      <path d="M12 22s7-4.5 7-12a7 7 0 1 0-14 0c0 7.5 7 12 7 12Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white/60"
    >
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 7h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function extractLatLng(input: string): { lat: string; lng: string } | null {
  // Google Maps URLs often contain @lat,lng or query=lat,lng
  const at = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return { lat: at[1], lng: at[2] };

  try {
    const url = new URL(input);
    const query = url.searchParams.get('q') || url.searchParams.get('query');
    if (query) {
      const m = query.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (m) return { lat: m[1], lng: m[2] };
    }
  } catch {
    // ignore
  }

  return null;
}

function buildGoogleStaticMapUrl({
  location,
  mapUrl,
}: {
  location: string;
  mapUrl?: string | null;
}): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const ll = mapUrl ? extractLatLng(mapUrl) : null;
  const center = ll ? `${ll.lat},${ll.lng}` : location;
  const marker = ll ? `${ll.lat},${ll.lng}` : location;

  const params = new URLSearchParams({
    size: '640x360',
    scale: '2',
    maptype: 'roadmap',
    zoom: ll ? '16' : '15',
    center,
    markers: `color:0xFBBF24|${marker}`,
    key,
  });

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export default function TimeLocationCard({
  time,
  location,
  mapUrl,
}: {
  time: string;
  location: string;
  mapUrl?: string | null;
}) {
  const staticMapUrl = mapUrl ? buildGoogleStaticMapUrl({ location, mapUrl }) : null;
  const link = mapUrl || null;

  return (
    <section className="w-full max-w-[760px] mx-auto">
      <div className="rounded-2xl bg-zinc-900 border border-white/10 px-5 py-4">
        <div className="font-semibold text-sm text-white/90">Thời gian &amp; Địa điểm</div>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 overflow-hidden rounded-xl border border-white/10"
          >
            {staticMapUrl ? (
              <img
                src={staticMapUrl}
                alt="Bản đồ"
                className="w-full h-[180px] md:h-[220px] object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-[180px] md:h-[220px] bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10">
                    <PinIcon />
                  </div>
                  <div className="mt-3 text-sm text-white/70">Xem bản đồ</div>
                  <div className="text-xs text-white/50">Mở Google Maps</div>
                </div>
              </div>
            )}
          </a>
        ) : null}

        <div className="mt-3 space-y-2 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <ClockIcon />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <PinIcon />
            <span>{location}</span>
          </div>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              <span>Mở Google Maps</span>
              <ArrowUpRightIcon />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
