import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { TOOLS } from "@/data/portfolio";
import { useState } from "react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — Forest Intelligence Suite" },
      { name: "description", content: "A connected ecosystem of decision-support tools: Digital Forestry Engine, SDImax, FOREST Site Type, Realized Gain, and Carrying Capacity models." },
      { property: "og:title", content: "Tools — Forest Intelligence Suite" },
      { property: "og:description", content: "An ecosystem of forest decision-support tools." },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [active, setActive] = useState<string | null>(null);
  const open = TOOLS.find((t) => t.id === active);
  return (
    <PageShell
      mood="data"
      eyebrow="02 · Tools"
      title={<>An ecosystem of <em className="italic text-acc">decision tools</em>, not a portfolio.</> as any}
      lede="Five connected systems that turn LiDAR, satellite, and field data into stand-level decisions — used by cooperative members across the Inland Northwest."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {TOOLS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="glass-strong relative overflow-hidden text-left p-7 transition-all duration-500 hover:-translate-y-1 group"
            style={{ animation: `fadeUp .7s cubic-bezier(.2,.7,.2,1) ${0.1 + i * 0.07}s both` }}
          >
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-25 blur-3xl group-hover:opacity-60 transition-opacity"
              style={{ background: "radial-gradient(circle, var(--acc), transparent 70%)" }}
            />
            <div className="relative">
              <div className="font-mono-tight text-[10.5px] text-acc-soft mb-4" style={{ letterSpacing: "0.24em" }}>
                {String(i + 1).padStart(2, "0")} · TOOL
              </div>
              <h3 className="font-display text-[clamp(24px,2.6vw,32px)] leading-tight m-0">{t.name}</h3>
              <p className="font-display italic text-[18px] mt-2 text-acc-soft m-0">{t.tagline}</p>
              <p className="mt-5 text-[14px] leading-[1.7] text-muted-fg m-0 line-clamp-3">{t.problem}</p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {t.chips.map((c) => (
                  <span key={c} className="font-mono-tight text-[10px] px-2 py-1 rounded-full text-acc-soft border border-[rgba(159,240,192,0.18)] bg-[rgba(95,217,154,0.04)]">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-6 font-mono-tight text-[11px] text-acc opacity-70 group-hover:opacity-100 transition">
                OPEN CASE STUDY →
              </div>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4"
          style={{ background: "rgba(3,8,6,0.78)", backdropFilter: "blur(14px)", animation: "fadeIn .3s ease both" }}
          onClick={() => setActive(null)}
        >
          <div
            className="glass-strong w-full max-w-[760px] max-h-[88vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeUp .4s cubic-bezier(.2,.7,.2,1) both" }}
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <div className="font-mono-tight text-[10.5px] text-acc-soft" style={{ letterSpacing: "0.24em" }}>CASE STUDY</div>
                <h3 className="font-display text-[clamp(28px,3.4vw,42px)] leading-tight m-0 mt-2">{open.name}</h3>
                <p className="font-display italic text-[20px] text-acc-soft mt-1 m-0">{open.tagline}</p>
              </div>
              <button onClick={() => setActive(null)} className="font-mono-tight text-[11px] text-faint border border-white/15 px-3 py-1.5 rounded-full hover:text-acc-soft">
                CLOSE
              </button>
            </div>
            <CaseBlock label="Problem" body={open.problem} />
            <CaseBlock label="Method" body={open.method} />
            <CaseBlock label="Output" body={open.output} />
            <CaseBlock label="Impact" body={open.impact} />
            <div className="mt-7 flex flex-wrap gap-1.5">
              {open.chips.map((c) => (
                <span key={c} className="font-mono-tight text-[10.5px] px-2.5 py-1 rounded-full text-acc-soft border border-[rgba(159,240,192,0.2)] bg-[rgba(95,217,154,0.06)]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function CaseBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="py-4 border-t border-white/5 first:border-t-0">
      <div className="font-mono-tight text-[10px] text-acc-soft mb-2" style={{ letterSpacing: "0.26em" }}>
        {label.toUpperCase()}
      </div>
      <p className="text-[15px] leading-[1.7] text-[var(--text)]/90 m-0">{body}</p>
    </div>
  );
}
