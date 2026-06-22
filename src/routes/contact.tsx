import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PERSON } from "@/data/portfolio";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jaslam Poolakkal, PhD" },
      { name: "description", content: "Get in touch about collaborations, grants, advising, or speaking — Jaslam Poolakkal, PhD." },
      { property: "og:title", content: "Contact — Jaslam Poolakkal, PhD" },
      { property: "og:description", content: "Get in touch about collaborations and grants." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell
      mood="forest"
      eyebrow="06 · Contact"
      title={<>Let&rsquo;s build something that <em className="italic text-acc">moves the forest forward.</em></> as any}
      lede="Open to collaborations on small-area estimation, LiDAR pipelines, decision-support tools, advising, and speaking."
    >
      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <a
          href={`mailto:${PERSON.email}`}
          className="glass-strong p-8 group transition-transform duration-500 hover:-translate-y-1 block"
        >
          <div className="font-mono-tight text-[10px] text-acc-soft mb-4" style={{ letterSpacing: "0.28em" }}>EMAIL</div>
          <div className="font-display text-[clamp(26px,3vw,38px)] text-acc-soft break-all leading-tight">{PERSON.email}</div>
          <div className="mt-6 font-mono-tight text-[11px] text-faint group-hover:text-acc-soft transition">
            COMPOSE A NOTE →
          </div>
        </a>
        <a
          href={PERSON.links.cv}
          target="_blank"
          rel="noreferrer"
          className="glass-strong p-8 group transition-transform duration-500 hover:-translate-y-1 block"
        >
          <div className="font-mono-tight text-[10px] text-acc-soft mb-4" style={{ letterSpacing: "0.28em" }}>RÉSUMÉ</div>
          <div className="font-display text-[clamp(26px,3vw,38px)] leading-tight">Download the full CV</div>
          <div className="mt-6 font-mono-tight text-[11px] text-faint group-hover:text-acc-soft transition">
            OPEN PDF ↗
          </div>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {[
          { label: "LinkedIn", href: PERSON.links.linkedin },
          { label: "Google Scholar", href: PERSON.links.scholar },
          { label: "ResearchGate", href: PERSON.links.researchgate },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="glass p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform duration-500"
          >
            <span className="font-display text-[18px]">{l.label}</span>
            <span className="font-mono-tight text-[11px] text-acc-soft">↗</span>
          </a>
        ))}
      </div>

      <div className="mt-20 max-w-[640px]">
        <div className="font-mono-tight text-[10.5px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>LOCATION</div>
        <div className="font-display text-[clamp(24px,2.6vw,32px)] leading-tight">
          Intermountain Forestry Cooperative · College of Natural Resources
        </div>
        <div className="font-mono-tight text-[11px] text-faint mt-3" style={{ letterSpacing: "0.22em" }}>
          UNIVERSITY OF IDAHO · MOSCOW, ID · 46.73°N · 117.00°W
        </div>
      </div>
    </PageShell>
  );
}
