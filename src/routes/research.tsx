import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { TIMELINE, SKILL_CLUSTERS } from "@/data/portfolio";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Jaslam Poolakkal, PhD" },
      { name: "description", content: "A decade-long arc from agricultural statistics to forest intelligence — career, methods, and signature questions." },
      { property: "og:title", content: "Research — Jaslam Poolakkal, PhD" },
      { property: "og:description", content: "Career timeline, methods, and signature research questions." },
      { property: "og:url", content: "/research" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/research" }],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <PageShell
      mood="overlay"
      eyebrow="01 · Research"
      title={<>A decade between <em className="italic text-acc">code and canopy.</em></> as any}
      lede="From small-area estimation of crop yields to wall-to-wall forest carrying capacity — a single arc, applied at increasing scale."
    >
      {/* Timeline */}
      <section className="relative mt-4">
        <ol className="relative">
          <span
            aria-hidden
            className="absolute left-[10px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(180deg, var(--acc), transparent)" }}
          />
          {TIMELINE.map((t) => (
            <li
              key={t.title + t.year}
              className="relative pl-10 py-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-8 gap-y-3 border-b border-white/5 last:border-b-0 group"
            >
              <span
                aria-hidden
                className="absolute left-[6px] top-9 w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-150"
                style={{ background: "var(--acc)", boxShadow: "0 0 12px var(--acc)" }}
              />
              <div className="min-w-0">
                <h3 className="font-display text-[clamp(24px,3.2vw,38px)] leading-tight m-0">{t.title}</h3>
                <div className="font-mono-tight text-[11px] text-acc-soft mt-2">{t.org}</div>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-muted-fg max-w-[760px] m-0">{t.body}</p>
              </div>
              <div className="font-mono-tight text-[11px] text-faint md:text-right md:pt-2">{t.year}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Skill clusters */}
      <section className="mt-24">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>
          METHODS · CLUSTERS
        </div>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-tight mb-10">
          Six expert clusters working as one toolkit.
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SKILL_CLUSTERS.map((c) => (
            <div key={c.label} className="glass p-6 transition-transform duration-500 hover:-translate-y-1">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-[22px] m-0">{c.label}</h3>
                <span className="dot-acc opacity-70" />
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {c.items.map((i) => (
                  <li
                    key={i}
                    className="font-mono-tight text-[10.5px] text-acc-soft px-2.5 py-1 rounded-full border border-[rgba(159,240,192,0.18)] bg-[rgba(95,217,154,0.04)]"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
