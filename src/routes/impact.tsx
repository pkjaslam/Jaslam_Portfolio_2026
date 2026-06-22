import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { STATS, GRANTS } from "@/data/portfolio";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — Research that ships" },
      { name: "description", content: "Numbers, grants, and institutional reach: $900K+ in funded research used by cooperatives, agencies, and graduate programs." },
      { property: "og:title", content: "Impact — Research that ships" },
      { property: "og:description", content: "Funded, peer-reviewed, institutionally adopted." },
      { property: "og:url", content: "/impact" },
    ],
    links: [{ rel: "canonical", href: "/impact" }],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  return (
    <PageShell
      mood="maps"
      eyebrow="04 · Impact"
      title={<>Research that <em className="italic text-acc">ships.</em></> as any}
      lede="$900K+ in funded research, deployed across federal agencies, university cooperatives, and operational forestry workflows."
    >
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatTile key={s.label} stat={s} delay={i * 0.08} />
        ))}
      </section>

      <section className="mt-24">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>
          GRANTS · CURRENT
        </div>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-tight mb-8">
          Four active grants, four agencies.
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {GRANTS.map((g) => (
            <div key={g.title} className="glass-strong p-7 relative overflow-hidden group transition-transform duration-500 hover:-translate-y-1">
              <div
                aria-hidden
                className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-25 blur-3xl group-hover:opacity-50 transition-opacity"
                style={{ background: "radial-gradient(circle, var(--acc), transparent 70%)" }}
              />
              <div className="relative flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="font-mono-tight text-[10.5px] text-acc-soft mb-2" style={{ letterSpacing: "0.22em" }}>
                    {g.role.toUpperCase()}
                  </div>
                  <div className="font-mono-tight text-[10.5px] text-faint mb-5">{g.src} · {g.years}</div>
                  <h3 className="font-display text-[clamp(20px,2.2vw,26px)] leading-snug m-0">{g.title}</h3>
                </div>
                <div className="font-display text-[clamp(30px,4.2vw,48px)] text-acc leading-none whitespace-nowrap">
                  {g.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>
          REACH · INSTITUTIONAL
        </div>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-tight mb-8">
          Tools in use across the continent.
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Cooperative members", value: "Inland Northwest", sub: "Intermountain Forestry Cooperative" },
            { label: "Federal partners", value: "USDA · USFS · NRCS", sub: "Operational adoption" },
            { label: "Academic reach", value: "NSF-IUCRC CAFS", sub: "5+ partner universities" },
          ].map((b) => (
            <div key={b.label} className="glass p-6">
              <div className="font-mono-tight text-[10px] text-acc-soft mb-3" style={{ letterSpacing: "0.24em" }}>
                {b.label.toUpperCase()}
              </div>
              <div className="font-display text-[24px] leading-tight">{b.value}</div>
              <div className="font-mono-tight text-[10.5px] text-faint mt-2">{b.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function StatTile({ stat, delay }: { stat: typeof STATS[number]; delay: number }) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="glass-strong p-6 transition-transform duration-500 hover:-translate-y-1"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transition: `opacity .8s ${delay}s, transform .8s ${delay}s`,
      }}
    >
      <div className="font-display text-[clamp(40px,5vw,68px)] leading-none text-acc">{stat.value}</div>
      <div className="font-display text-[16px] mt-3">{stat.label}</div>
      <div className="font-mono-tight text-[10.5px] text-faint mt-2">{stat.sub}</div>
    </div>
  );
}
