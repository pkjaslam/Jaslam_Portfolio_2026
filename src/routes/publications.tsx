import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PUBLICATIONS, PERSON } from "@/data/portfolio";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/publications")({
  head: () => ({
    meta: [
      { title: "Publications — Jaslam Poolakkal, PhD" },
      { name: "description", content: "A curated explorer of peer-reviewed research across remote sensing, statistics, forestry, and machine learning." },
      { property: "og:title", content: "Publications — Jaslam Poolakkal, PhD" },
      { property: "og:description", content: "Curated explorer of peer-reviewed research." },
      { property: "og:url", content: "/publications" },
    ],
    links: [{ rel: "canonical", href: "/publications" }],
  }),
  component: PublicationsPage,
});

function PublicationsPage() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const topics = useMemo(() => Array.from(new Set(PUBLICATIONS.map((p) => p.topic))), []);
  const years = useMemo(() => Array.from(new Set(PUBLICATIONS.map((p) => p.y))).sort((a, b) => b - a), []);

  const filtered = PUBLICATIONS.filter((p) => {
    if (topic && p.topic !== topic) return false;
    if (year && p.y !== year) return false;
    if (q) {
      const s = (p.t + " " + p.a + " " + p.j).toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <PageShell
      mood="data"
      eyebrow="03 · Publications"
      title={<>A growing record of <em className="italic text-acc">peer-reviewed work.</em></> as any}
      lede="22 peer-reviewed articles, 2 books, and 2 book chapters across remote sensing, small-area estimation, machine learning, and forestry."
    >
      {/* Filter bar */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, journal…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-full px-5 py-3 text-[14px] focus:outline-none focus:border-[var(--acc)] transition"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono-tight text-[10px] text-faint">⌘K</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={topic === null} onClick={() => setTopic(null)}>All topics</Chip>
          {topics.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(t === topic ? null : t)}>{t}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={year === null} onClick={() => setYear(null)}>All years</Chip>
          {years.map((y) => (
            <Chip key={y} active={year === y} onClick={() => setYear(y === year ? null : y)}>{String(y)}</Chip>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="mb-12">
          <div className="font-mono-tight text-[10.5px] text-acc-soft mb-4" style={{ letterSpacing: "0.26em" }}>
            FEATURED
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((p) => (
              <PubCard key={p.t} pub={p} featured />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="font-mono-tight text-[10.5px] text-faint mb-4" style={{ letterSpacing: "0.26em" }}>
          ALL RESULTS · {filtered.length}
        </div>
        <ul className="divide-y divide-white/5">
          {rest.map((p) => (
            <li key={p.t} className="py-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 group">
              <div className="min-w-0">
                <h3 className="font-display text-[clamp(17px,1.7vw,21px)] leading-snug m-0 group-hover:text-acc-soft transition">
                  {p.t}
                </h3>
                <div className="font-mono-tight text-[10.5px] text-faint mt-2">
                  {p.a} &nbsp;·&nbsp; {p.j} · {p.y}
                  {p.if ? <> · IF {p.if}</> : null}
                </div>
              </div>
              <div className="flex items-center gap-3 text-faint font-mono-tight text-[10.5px]">
                <span className="px-2 py-1 rounded-full border border-white/10">{p.topic}</span>
              </div>
            </li>
          ))}
          {rest.length === 0 && featured.length === 0 && (
            <li className="py-12 text-center text-muted-fg">No matches — try a different filter.</li>
          )}
        </ul>
      </section>

      <div className="mt-12 flex justify-between items-center flex-wrap gap-4">
        <div className="font-mono-tight text-[10.5px] text-faint">
          REVIEWER · Springer Nature · IOS Press
        </div>
        <a
          href={PERSON.links.scholar}
          target="_blank"
          rel="noreferrer"
          className="font-mono-tight text-[11px] text-acc hover:text-acc-soft transition"
        >
          ALL 22 PUBLICATIONS ON SCHOLAR ↗
        </a>
      </div>
    </PageShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-mono-tight text-[10.5px] px-3 py-1.5 rounded-full transition border"
      style={{
        color: active ? "#04120a" : "var(--acc-soft)",
        background: active ? "var(--acc)" : "rgba(95,217,154,0.04)",
        borderColor: active ? "var(--acc)" : "rgba(159,240,192,0.2)",
        letterSpacing: "0.18em",
      }}
    >
      {children}
    </button>
  );
}

function PubCard({ pub, featured }: { pub: typeof PUBLICATIONS[number]; featured?: boolean }) {
  return (
    <div className="glass-strong p-6 transition-transform duration-500 hover:-translate-y-1">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono-tight text-[10px] text-acc-soft" style={{ letterSpacing: "0.24em" }}>
          {pub.topic.toUpperCase()}
        </span>
        <span className="font-mono-tight text-[10px] text-faint">{pub.y}</span>
      </div>
      <h3 className="font-display text-[clamp(19px,2vw,24px)] leading-snug m-0">{pub.t}</h3>
      <div className="font-mono-tight text-[10.5px] text-faint mt-3">
        {pub.a} · {pub.j}
        {pub.if ? <> · IF {pub.if}</> : null}
      </div>
    </div>
  );
}
