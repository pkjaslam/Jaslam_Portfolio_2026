import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PERSON } from "@/data/portfolio";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jaslam Poolakkal, PhD" },
      { name: "description", content: "Bio, education, certifications, and affiliations of Jaslam Poolakkal — Lead Data Scientist at the Intermountain Forestry Cooperative." },
      { property: "og:title", content: "About — Jaslam Poolakkal, PhD" },
      { property: "og:description", content: "Bio, education, certifications, and affiliations." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const EDU = [
  { deg: "PhD", year: "2021", field: "Statistics", org: "CCS Haryana Agricultural University, Hisar, India", body: "Small-area estimation of crop yield using remote-sensing data." },
  { deg: "MSc", year: "2017", field: "Agricultural Statistics", org: "Kerala Agricultural University, Thrissur, India", body: "Profit-maximization model for Kerala homesteads." },
  { deg: "BSc", year: "2015", field: "Agricultural Sciences", org: "Acharya N.G. Ranga Agricultural University", body: "ASRB National Eligibility Test (NET-II) qualified." },
];

const AWARDS = [
  ["2024", "IIDS Generative AI Fellow", "University of Idaho"],
  ["2023", "Outstanding Postdoctoral Research", "College of Natural Resources"],
  ["2021", "Best PhD Thesis (Statistics)", "CCS HAU"],
  ["2017", "ASRB NET-II Qualified", "Indian Council of Agricultural Research"],
];

function AboutPage() {
  return (
    <PageShell
      mood="forest"
      eyebrow="05 · About"
      title={<>Trained where <em className="italic text-acc">statistics meets the soil.</em></> as any}
      lede="A data scientist by training, a forester by application. I build the statistical and machine-learning systems that translate raw signal into operational decisions."
    >
      <section className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="font-mono-tight text-[10.5px] text-acc-soft mb-4" style={{ letterSpacing: "0.28em" }}>BIO</div>
          <div className="space-y-5 text-[15.5px] leading-[1.75] text-[var(--text)]/90 max-w-[640px]">
            <p>
              I lead the data science effort at the Intermountain Forestry Cooperative
              (College of Natural Resources, University of Idaho). My work blends classical
              statistics, modern machine learning, and remote sensing to produce decision
              tools that members and agencies actually use in the field.
            </p>
            <p>
              I trained as an agricultural statistician — small-area estimation, sampling theory,
              design of experiments — and then turned that toolkit on forests, where the data are
              messier and the stakes are longer.
            </p>
            <p>
              Today my research focuses on carrying capacity, site index, density management, and
              the next generation of LiDAR-driven inventory.
            </p>
          </div>
        </div>
        <aside className="glass-strong p-7 h-fit">
          <div className="font-mono-tight text-[10.5px] text-acc-soft mb-5" style={{ letterSpacing: "0.28em" }}>
            VITALS
          </div>
          <dl className="space-y-4 text-[14px]">
            {[
              ["Role", PERSON.role],
              ["Affiliation", PERSON.org],
              ["Location", PERSON.location],
              ["Email", PERSON.email],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-4">
                <dt className="font-mono-tight text-[10px] text-faint pt-0.5" style={{ letterSpacing: "0.22em" }}>{k.toUpperCase()}</dt>
                <dd className="text-[var(--text)]/90 m-0">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="mt-24">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>EDUCATION</div>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-tight mb-8">Three degrees, one through-line.</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {EDU.map((e) => (
            <div key={e.deg} className="glass p-6">
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-display text-[44px] leading-none text-acc">{e.deg}</span>
                <span className="font-mono-tight text-[10.5px] text-faint">{e.year}</span>
              </div>
              <div className="font-display italic text-[20px] mb-1">{e.field}</div>
              <div className="font-mono-tight text-[10.5px] text-acc-soft mb-3">{e.org}</div>
              <p className="text-[13.5px] leading-[1.65] text-muted-fg m-0">{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3" style={{ letterSpacing: "0.28em" }}>HONORS</div>
        <h2 className="font-display text-[clamp(28px,3.6vw,46px)] leading-tight mb-8">Recognition.</h2>
        <ul className="divide-y divide-white/5">
          {AWARDS.map(([y, t, o]) => (
            <li key={t} className="py-5 grid grid-cols-[80px_1fr_auto] gap-6 items-baseline">
              <span className="font-mono-tight text-[11px] text-acc">{y}</span>
              <span className="font-display text-[18px]">{t}</span>
              <span className="font-mono-tight text-[10.5px] text-faint">{o}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
