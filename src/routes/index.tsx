import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NodeNetworkCanvas } from "@/components/forestry/NodeNetworkCanvas";
import { CinematicScene, SceneDivider } from "@/components/forestry/CinematicScene";

import { SplashForestAmbience } from "@/components/forestry/AmbientAudio";
import { AffiliationsPanel } from "@/components/forestry/AffiliationsPanel";
import lidarCanopy from "@/assets/lidar-canopy.jpg";
import topoContours from "@/assets/topo-contours.jpg";
import forestMist from "@/assets/forest-mist.jpg";
import jaslamWalkLoop from "@/assets/jaslam-walk-loop.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaslam Poolakkal, PhD — AI Data Scientist · Forest Biometrics" },
      {
        name: "description",
        content:
          "Lead Data Scientist at the Intermountain Forestry Cooperative, University of Idaho. LiDAR, satellite imagery and machine learning for measuring, managing and sustaining forests.",
      },
      { property: "og:title", content: "Jaslam Poolakkal, PhD — AI · Forest Biometrics" },
      {
        property: "og:description",
        content:
          "Machine learning, rooted in the forest. LiDAR, geospatial intelligence and statistical modeling for sustainable forestry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const NAV = [
  { id: "approach", label: "APPROACH" },
  { id: "experience", label: "WORK" },
  { id: "grants", label: "FUNDING" },
  { id: "publications", label: "RESEARCH" },
];

function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let raf = 0;
    let target = 0;
    let current = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, y / max) : 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Spring-smoothed progress rail — critically-damped lerp toward target.
    const tick = () => {
      const next = current + (target - current) * 0.12;
      if (Math.abs(target - next) < 0.0005) {
        current = target;
        setProgress(current);
        raf = 0;
        return;
      }
      current = next;
      setProgress(current);
      raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen text-[var(--text)]">
      <PageAtmosphere progress={progress} />
      <BootSplash done={booted} />
      {/* Global nav lives in __root.tsx (SiteNav) */}
      <Hero goto={goto} />
      <SceneDivider label="01 / APPROACH" mood="forest" />
      <CinematicScene camera="settle" intensity={1}>
        <Approach />
      </CinematicScene>
      <SceneDivider label="02 / EXPERIENCE" mood="overlay" />
      <CinematicScene camera="rise" intensity={1}>
        <Experience />
      </CinematicScene>
      <SceneDivider label="03 / FUNDING" mood="maps" />
      <CinematicScene camera="drift" intensity={1}>
        <Grants />
      </CinematicScene>
      <SceneDivider label="04 / EDUCATION" mood="data" />
      <CinematicScene camera="settle" intensity={0.8}>
        <Education />
      </CinematicScene>
      <SceneDivider label="05 / PUBLICATIONS" mood="data" />
      <CinematicScene camera="rise" intensity={0.9}>
        <Publications />
      </CinematicScene>
      <SceneDivider label="06 / HONORS" mood="overlay" />
      <CinematicScene camera="drift" intensity={0.8}>
        <Awards />
      </CinematicScene>
      <SceneDivider label="07 / CREDENTIALS" mood="overlay" />
      <CinematicScene camera="settle" intensity={0.7}>
        <Certifications />
      </CinematicScene>
      <SceneDivider label="08 / CONTACT" mood="forest" />
      <CinematicScene camera="zoom" intensity={1}>
        <Contact />
      </CinematicScene>
    </div>
  );
}

/* ---------------- Page atmosphere ----------------
 * A single fixed background that morphs as you scroll: forest → overlays →
 * maps → data → back to forest. Each "mood" is a stacked gradient layer that
 * fades in/out based on its scroll-band weight.
 */
function PageAtmosphere({ progress }: { progress: number }) {
  // Five cinematic moods, each peaking at a scroll band.
  // forest → overlay → maps → data → forest (return)
  const peaks = [0.0, 0.27, 0.52, 0.78, 1.0];
  const w = peaks.map((c) => {
    const d = Math.abs(progress - c);
    // wider band + smoother falloff so transitions feel continuous, not flat black
    return Math.max(0, 1 - Math.pow(d / 0.36, 1.5));
  });
  const total = w.reduce((a, b) => a + b, 0) || 1;
  const n = w.map((x) => x / total);

  const moods = [
    // 0 — Night forest, mossy depth, soft fog
    "radial-gradient(70% 55% at 50% 28%, rgba(34,92,62,0.55), transparent 72%), radial-gradient(50% 40% at 20% 80%, rgba(18,46,32,0.5), transparent 70%), linear-gradient(180deg,#050a07 0%, #0a1612 60%, #06100b 100%)",
    // 1 — Forest with scientific overlay tint (cool teal cast)
    "radial-gradient(70% 60% at 20% 30%, rgba(95,217,154,0.16), transparent 72%), radial-gradient(60% 50% at 80% 70%, rgba(230,178,102,0.09), transparent 72%), linear-gradient(180deg,#06100c 0%, #0a1a14 100%)",
    // 2 — Cartographic — slate-teal with copper sunrise hint
    "radial-gradient(80% 60% at 70% 30%, rgba(95,217,154,0.16), transparent 70%), radial-gradient(60% 50% at 20% 70%, rgba(72,140,180,0.18), transparent 75%), linear-gradient(180deg,#071612 0%, #0a1f1a 100%)",
    // 3 — Data — deep ink with phosphor green grid glow
    "radial-gradient(70% 55% at 50% 50%, rgba(95,217,154,0.18), transparent 70%), linear-gradient(180deg,#03080a 0%, #051410 60%, #03090b 100%)",
    // 4 — Forest returns, warmer dawn
    "radial-gradient(60% 50% at 50% 70%, rgba(34,92,62,0.55), transparent 70%), radial-gradient(50% 40% at 80% 20%, rgba(230,178,102,0.10), transparent 70%), linear-gradient(180deg,#060d09 0%, #0a1410 100%)",
  ];

  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
      {/* base mood crossfade */}
      {moods.map((bg, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ background: bg, opacity: n[i], transition: "opacity .9s ease-out" }}
        />
      ))}

      {/* forest mist photo — present in forest bands */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          backgroundImage: `url(${forestMist})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: (n[0] + n[4]) * 0.55,
          transition: "opacity .9s",
        }}
      />

      {/* LiDAR canopy ghost — overlay band */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${lidarCanopy})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: n[1] * 0.32,
          mixBlendMode: "screen",
          filter: "saturate(0.6) hue-rotate(-10deg)",
          transition: "opacity .9s",
        }}
      />

      {/* Topographic contours — maps band */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${topoContours})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: n[2] * 0.42,
          mixBlendMode: "screen",
          transition: "opacity .9s",
        }}
      />

      {/* Coordinate ticks — maps & data */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 119px, rgba(95,217,154,0.08) 119px 120px), repeating-linear-gradient(0deg, transparent 0 119px, rgba(95,217,154,0.08) 119px 120px)",
          opacity: (n[2] + n[3]) * 0.55,
          transition: "opacity .9s",
        }}
      />

      {/* Phosphor data grid — data band */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 39px, rgba(95,217,154,0.07) 39px 40px), repeating-linear-gradient(0deg, transparent 0 39px, rgba(95,217,154,0.07) 39px 40px)",
          opacity: n[3] * 0.7,
          mixBlendMode: "screen",
          transition: "opacity .9s",
        }}
      />

      {/* drifting point-cloud motes — overlay/maps/data */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 18%, rgba(159,240,192,0.6), transparent 60%), radial-gradient(1.2px 1.2px at 78% 32%, rgba(159,240,192,0.45), transparent 60%), radial-gradient(1px 1px at 34% 72%, rgba(159,240,192,0.55), transparent 60%), radial-gradient(1.4px 1.4px at 62% 84%, rgba(95,217,154,0.5), transparent 60%), radial-gradient(1px 1px at 88% 58%, rgba(159,240,192,0.5), transparent 60%), radial-gradient(1px 1px at 8% 60%, rgba(159,240,192,0.5), transparent 60%)",
          opacity: (n[1] + n[2] + n[3]) * 0.7,
          animation: "atmosDrift 24s linear infinite",
          transition: "opacity .9s",
        }}
      />

      {/* subtle film vignette + grain — always-on cohesion */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 100% at 50% 50%, transparent 55%, rgba(3,8,6,0.45) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />

      <style>{`
        @keyframes atmosDrift {
          0% { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
          100% { background-position: 40px -20px, -30px 25px, 25px 30px, -20px -25px, 30px 20px, -25px -30px; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Boot splash ---------------- */
function BootSplash({ done }: { done: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--forest-bg)",
        overflow: "hidden",
        opacity: done ? 0 : 1,
        visibility: done ? "hidden" : "visible",
        transition: "opacity 1.1s cubic-bezier(.4,0,.2,1), visibility 0s linear 1.1s",
      }}
    >
      {/* cinematic walking loop — always shows the full subject on every screen.
          A blurred cover copy fills the viewport behind a contained focal copy. */}
      <video
        src={jaslamWalkLoop.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          background: "var(--forest-bg)",
          filter: "saturate(1.1) contrast(1.05) brightness(0.7) blur(28px)",
          transform: "scale(1.15)",
        }}
      />
      <video
        src={jaslamWalkLoop.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
          filter: "saturate(1.05) contrast(1.05) brightness(0.95)",
          animation: "splashBreath 14s ease-in-out infinite",
        }}
      />

      {/* cinematic forest ambience — wind, low pad, sparse bird chirps */}
      <SplashForestAmbience active={!done} />

      {/* atmospheric grade */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 35%, rgba(6,11,8,0) 35%, rgba(6,11,8,0.30) 75%, rgba(6,11,8,0.60) 100%), linear-gradient(180deg, rgba(6,11,8,0.30) 0%, rgba(6,11,8,0.04) 30%, rgba(6,11,8,0.12) 60%, rgba(6,11,8,0.80) 100%)",
        }}
      />

      {/* film grain / scanline tint */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "overlay",
          opacity: 0.25,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* typography */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "clamp(60px, 12vh, 120px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "0 24px",
          animation: "fadeUp 1.6s cubic-bezier(.2,.7,.2,1) .6s both",
        }}
      >
        <div className="font-mono-tight text-[10px] text-acc-soft" style={{ letterSpacing: "0.42em" }}>
          FOREST INTELLIGENCE · 2026
        </div>
        <div className="flex items-center gap-3">
          <span className="dot-acc" />
          <span className="font-display text-[clamp(28px,5.4vw,52px)] tracking-tight shimmer-text">
            Jaslam Poolakkal
          </span>
        </div>
        <div className="font-mono-tight text-[10.5px] text-acc-soft" style={{ letterSpacing: "0.32em" }}>
          DECODING&nbsp;FOREST&nbsp;SYSTEMS
        </div>
        <div className="h-[2px] w-[min(280px,62vw)] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <span
            style={{
              display: "block",
              height: "100%",
              width: done ? "100%" : "8%",
              background: "linear-gradient(90deg,var(--acc),var(--acc-soft))",
              boxShadow: "0 0 12px var(--acc)",
              transition: "width 2.6s cubic-bezier(.3,.7,.2,1)",
              animation: "splashFill 3.1s cubic-bezier(.4,.0,.2,1) forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sticky nav ---------------- */
function TopNav({
  scrolled,
  progress,
  goto,
}: {
  scrolled: boolean;
  progress: number;
  goto: (id: string) => void;
}) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        opacity: scrolled ? 1 : 0,
        transform: scrolled ? "translateY(0)" : "translateY(-100%)",
        pointerEvents: scrolled ? "auto" : "none",
        transition: "opacity .5s, transform .55s cubic-bezier(.2,.7,.2,1)",
        backdropFilter: "blur(20px) saturate(160%)",
        background: "rgba(6,11,8,.72)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
      }}
      className="flex items-center justify-between gap-4 px-[clamp(20px,4vw,56px)] py-3.5"
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <span className="dot-acc" />
        <span className="font-display text-[20px]">Jaslam Poolakkal</span>
      </button>
      <div className="hidden md:flex items-center gap-[clamp(13px,1.9vw,28px)]">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => goto(n.id)}
            className="font-mono-tight text-[11px] text-faint hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            {n.label}
          </button>
        ))}
        <a
          href="https://5361daaa-9b81-4a19-9494-4249648ebec0.filesusr.com/ugd/e61ec6_391403cc6b76405caf09fceb8992ab4f.pdf"
          target="_blank"
          rel="noreferrer"
          className="font-mono-tight text-[11px] text-[#04120a] bg-[var(--acc)] px-[15px] py-2 rounded-full hover:brightness-110 transition"
        >
          RÉSUMÉ ↗
        </a>
      </div>
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: -1,
          height: 2,
          width: "100%",
          transformOrigin: "left center",
          transform: `scaleX(${progress})`,
          background: "linear-gradient(90deg,var(--acc),var(--acc-soft))",
          boxShadow: "0 0 10px var(--acc)",
          willChange: "transform",
        }}
      />
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ goto }: { goto: (id: string) => void }) {
  const [py, setPy] = useState(0);
  useEffect(() => {
    const on = () => setPy(window.scrollY || 0);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* parallax aerial canopy backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 z-[0] pointer-events-none"
        style={{
          backgroundImage: `url(${lidarCanopy})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          transform: `translate3d(0, ${py * 0.18}px, 0) scale(1.08)`,
          opacity: 0.42,
          willChange: "transform",
          filter: "saturate(0.85)",
        }}
      />
      <NodeNetworkCanvas className="absolute inset-0 z-[1] w-full h-full block pointer-events-auto" />
      {/* Soft edge vignette — ≤18% opacity at the corners, nothing in the center. */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 110% at 50% 50%, rgba(6,11,8,0) 55%, rgba(6,11,8,0.10) 82%, rgba(6,11,8,0.18) 100%)",
        }}
      />

      {/* top brand row */}
      <div
        className="relative z-[5] flex items-center justify-between gap-4 flex-wrap px-[clamp(20px,4vw,56px)] py-6"
        style={{ animation: "fadeIn 1.1s ease .1s both" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="dot-acc" />
          <span className="font-mono-tight text-[11.5px] text-[rgba(241,239,232,0.8)]">
            JASLAM POOLAKKAL, PhD
          </span>
        </div>
        <div className="flex gap-5 font-mono-tight text-[11px]">
          {[
            ["LINKEDIN", "https://www.linkedin.com/in/jaslampk/"],
            ["SCHOLAR", "https://scholar.google.co.in/citations?user=arO7QMUAAAAJ&hl=en"],
            ["RESEARCHGATE", "https://www.researchgate.net/profile/Muhammed-P-K-2"],
          ].map(([l, h]) => (
            <a
              key={l}
              href={h}
              target="_blank"
              rel="noreferrer"
              className="text-[rgba(241,239,232,0.52)] hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* hero content */}
      <div className="relative z-[5] flex-1 flex flex-wrap items-center justify-between gap-[clamp(40px,5vw,72px)] px-[clamp(20px,4vw,56px)] pt-[clamp(18px,3vh,40px)]">
        <div className="flex-[1_1_540px] min-w-[300px] max-w-[780px]">
          <div className="chip mb-[clamp(20px,2.6vh,30px)]" style={{ animation: "fadeUp .9s cubic-bezier(.2,.7,.2,1) .25s both" }}>
            <span className="dot-acc" style={{ width: 6, height: 6 }} />
            AI DATA SCIENTIST&nbsp;·&nbsp;FOREST BIOMETRICS
          </div>
          <h1 className="font-display font-normal leading-[0.92] tracking-[-0.012em] text-[clamp(44px,7.4vw,118px)] m-0">
            <span className="block" style={{ animation: "fadeUp 1s cubic-bezier(.2,.7,.2,1) .36s both" }}>
              Understanding forests through
            </span>
            <span
              className="block italic text-acc"
              style={{ animation: "fadeUp 1s cubic-bezier(.2,.7,.2,1) .48s both" }}
            >
              data, models, and intelligence.
            </span>
          </h1>
          <p
            className="mt-[clamp(24px,3vh,34px)] max-w-[600px] text-[clamp(15.5px,1.4vw,18.5px)] leading-[1.62] text-muted-fg"
            style={{ animation: "fadeUp 1s cubic-bezier(.2,.7,.2,1) .62s both" }}
          >
            I combine LiDAR, satellite imagery, field observations, and machine learning to
            reveal patterns hidden across forest landscapes — building tools that help measure,
            manage, and sustain the forests of tomorrow.
          </p>
          <div
            className="flex flex-wrap gap-3.5 mt-[clamp(28px,3.6vh,40px)]"
            style={{ animation: "fadeUp 1s cubic-bezier(.2,.7,.2,1) .76s both" }}
          >
            <button
              onClick={() => goto("publications")}
              className="font-mono-tight text-[12px] text-[#04120a] bg-[var(--acc)] px-[22px] py-3.5 rounded-full hover:brightness-110 hover:-translate-y-0.5 transition cursor-pointer"
            >
              VIEW RESEARCH →
            </button>
            <button
              onClick={() => goto("contact")}
              className="font-mono-tight text-[12px] text-[var(--text)] border border-[rgba(241,239,232,0.24)] px-[22px] py-3.5 rounded-full hover:border-[rgba(241,239,232,0.55)] hover:bg-white/5 transition cursor-pointer"
            >
              GET IN TOUCH
            </button>
          </div>
        </div>

        {/* affiliations + telemetry */}
        <div
          className="flex-[0_1_360px] min-w-[280px] flex flex-col items-center gap-5"
          style={{ animation: "fadeUp 1.1s cubic-bezier(.2,.7,.2,1) .6s both" }}
        >
          <AffiliationsPanel />
          <TelemetryCard />
        </div>
      </div>

      {/* hero footer strip */}
      <div className="relative z-[5] px-[clamp(20px,4vw,56px)] pb-7 pt-10">
        <div className="hairline mb-5" />
        <div className="flex flex-wrap items-end justify-between gap-6 font-mono-tight text-[11px] text-faint">
          <div>46.73°N · 117.00°W &nbsp;·&nbsp; MOSCOW · IDAHO</div>
          <div>
            INTERMOUNTAIN FORESTRY COOPERATIVE &nbsp;·&nbsp; COLLEGE OF NATURAL RESOURCES · UNIVERSITY OF IDAHO
          </div>
          <div className="flex items-center gap-2 text-acc-soft">
            <span style={{ animation: "blink 1.4s infinite" }}>▼</span> SCROLL
          </div>
        </div>
      </div>
    </section>
  );
}

function AvatarPortrait() {
  return (
    <div
      className="relative w-full max-w-[340px] mx-auto"
      style={{ aspectRatio: "6 / 7" }}
    >
      {/* outer halo */}
      <span
        aria-hidden
        className="absolute -inset-8 rounded-[28px] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(95,217,154,0.22), rgba(95,217,154,0) 75%)",
          animation: "haloPulse 6s ease-in-out infinite",
        }}
      />

      {/* breathing frame */}
      <div
        className="relative w-full h-full rounded-[22px] overflow-hidden"
        style={{
          border: "1px solid rgba(159,240,192,0.28)",
          boxShadow:
            "0 30px 80px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(6,11,8,0.6) inset, 0 0 60px -20px rgba(95,217,154,0.25)",
          animation: "floatY 7s ease-in-out infinite",
        }}
      >
        {/* portrait — slow parallax zoom */}
        <img
          src={forestMist}
          alt="Jaslam Poolakkal — Forest Intelligence researcher walking through a night canopy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "50% 28%",
            filter: "saturate(1.02) contrast(1.05) brightness(0.96)",
            transformOrigin: "50% 40%",
            animation: "heroDrift 18s ease-in-out infinite alternate",
          }}
        />

        {/* atmospheric fog */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 100%, rgba(95,217,154,0.18), transparent 60%), radial-gradient(80% 40% at 50% 0%, rgba(6,11,8,0.6), transparent 70%)",
          }}
        />

        {/* LiDAR scan sweep */}
        <span
          aria-hidden
          className="absolute inset-x-0 h-28 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(159,240,192,0.0) 30%, rgba(159,240,192,0.35) 50%, rgba(95,217,154,0.0) 70%, transparent 100%)",
            filter: "blur(2px)",
            animation: "scanline 6s linear infinite",
          }}
        />

        {/* drifting particles (pure CSS dots) */}
        <Particles />

        {/* HUD bracket corners */}
        {[
          "top-3 left-3 border-t border-l",
          "top-3 right-3 border-t border-r",
          "bottom-3 left-3 border-b border-l",
          "bottom-3 right-3 border-b border-r",
        ].map((pos, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute w-5 h-5 ${pos}`}
            style={{ borderColor: "rgba(159,240,192,0.55)" }}
          />
        ))}

        {/* floating holographic chip — top-right */}
        <span
          className="absolute top-4 right-4 font-mono-tight text-[8.5px] px-2 py-1 rounded-sm text-acc-soft"
          style={{
            background: "rgba(6,11,8,0.55)",
            border: "1px solid rgba(159,240,192,0.3)",
            letterSpacing: "0.22em",
            animation: "floatY 5s ease-in-out infinite",
          }}
        >
          ◢ LiDAR · 0.42 m
        </span>

        {/* floating holographic chip — mid-left */}
        <span
          className="absolute top-1/2 left-3 -translate-y-1/2 font-mono-tight text-[8.5px] px-2 py-1 rounded-sm text-acc-soft"
          style={{
            background: "rgba(6,11,8,0.55)",
            border: "1px solid rgba(159,240,192,0.25)",
            letterSpacing: "0.22em",
            animation: "floatY 6.5s ease-in-out infinite .8s",
          }}
        >
          CANOPY · 28.4 m
        </span>

        {/* footer holographic stat strip */}
        <div
          className="absolute inset-x-3 bottom-12 flex items-center justify-between font-mono-tight text-[8.5px] text-acc-soft"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,11,8,0) 0%, rgba(6,11,8,0.65) 20%, rgba(6,11,8,0.65) 80%, rgba(6,11,8,0) 100%)",
            padding: "6px 10px",
            letterSpacing: "0.22em",
          }}
        >
          <span>BIOMASS 412 Mg·ha⁻¹</span>
          <span style={{ animation: "blink 1.6s infinite" }}>● LIVE</span>
        </div>

        {/* bottom vignette for legibility */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, rgba(6,11,8,0.55) 100%)",
          }}
        />
      </div>

      {/* live tag */}
      <span
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full font-mono-tight text-[9.5px] text-acc-soft whitespace-nowrap"
        style={{
          background: "rgba(6,11,8,0.92)",
          border: "1px solid rgba(159,240,192,0.32)",
          backdropFilter: "blur(8px)",
          letterSpacing: "0.28em",
        }}
      >
        <span className="dot-acc" style={{ width: 5, height: 5, animation: "blink 1.4s infinite" }} />
        DECODING FOREST SYSTEMS
      </span>
    </div>
  );
}

function Particles() {
  // 14 small drifting motes, deterministic positions
  const motes = Array.from({ length: 14 }, (_, i) => {
    const left = (i * 37) % 100;
    const top = (i * 53) % 100;
    const dur = 6 + ((i * 13) % 9);
    const delay = (i * 0.7) % 5;
    const size = 1.5 + ((i * 7) % 3) * 0.6;
    return { left, top, dur, delay, size, key: i };
  });
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {motes.map((m) => (
        <span
          key={m.key}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            background: "rgba(159,240,192,0.85)",
            boxShadow: "0 0 6px rgba(95,217,154,0.7)",
            animation: `floatY ${m.dur}s ease-in-out ${m.delay}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

function TelemetryCard() {
  const MODELS = [
    { n: "01", t: "Digital Forestry Engine" },
    { n: "02", t: "Forest Carrying Capacity Models" },
    { n: "03", t: "Forest Site Type Intelligence" },
    { n: "04", t: "Growth & Yield Models" },
    { n: "05", t: "Site Index Analytics" },
  ];
  const SIGNALS = ["LIDAR", "SATELLITE", "FIELD", "AI"];
  return (
    <div className="glass-strong relative w-full max-w-[380px] overflow-hidden">
      {/* slow scan sweep */}
      <div
        aria-hidden
        className="absolute inset-x-0 h-16 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(95,217,154,0.12), transparent)",
          animation: "scanline 6s linear infinite",
        }}
      />

      {/* header */}
      <div className="relative flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="dot-acc" style={{ width: 7, height: 7, animation: "blink 1.4s infinite" }} />
          <span className="font-mono-tight text-[10.5px] text-acc-soft" style={{ letterSpacing: "0.26em" }}>
            FOREST SIGNAL
          </span>
        </div>
        <span className="font-mono-tight text-[9.5px] text-faint" style={{ letterSpacing: "0.26em" }}>
          v2.6 · LIVE
        </span>
      </div>

      {/* models — numbered, monospaced, calm */}
      <div className="relative px-5 pt-4 pb-3">
        <div className="font-mono-tight text-[9px] text-faint mb-3" style={{ letterSpacing: "0.32em" }}>
          ACTIVE MODELS
        </div>
        <ul className="space-y-1.5">
          {MODELS.map((m, i) => (
            <li
              key={m.t}
              className="flex items-center gap-3 group"
              style={{ animation: `fadeUp .7s cubic-bezier(.2,.7,.2,1) ${0.15 + i * 0.08}s both` }}
            >
              <span className="font-mono-tight text-[9.5px] text-acc-soft w-5">{m.n}</span>
              <span className="flex-1 font-display text-[14px] leading-snug text-[var(--text)]/95">
                {m.t}
              </span>
              <span
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                style={{
                  width: 5, height: 5, borderRadius: 999,
                  background: "var(--acc)", boxShadow: "0 0 6px var(--acc)",
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* signal source chips */}
      <div className="relative px-5 pb-4 flex flex-wrap gap-1.5">
        {SIGNALS.map((s) => (
          <span
            key={s}
            className="font-mono-tight text-[9px] px-2 py-1 rounded-full"
            style={{
              color: "var(--acc-soft)",
              background: "rgba(95,217,154,0.06)",
              border: "1px solid rgba(95,217,154,0.16)",
              letterSpacing: "0.22em",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="relative h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, rgba(95,217,154,0.35), transparent)" }} />

      {/* metrics — three across, equal weight */}
      <div className="relative px-5 py-4 grid grid-cols-3 gap-2.5">
        <Metric label="PEER REVIEWED" value="22" />
        <Metric label="FUNDING" value="$900K" />
        <Metric label="GRANTS" value="04" />
      </div>

      {/* US footprint */}
      <USOutlineMetric />
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
      <div className="font-display text-[26px] leading-none text-[var(--text)]">{value}</div>
      <div className="font-mono-tight text-[8.5px] mt-1.5 text-faint" style={{ letterSpacing: "0.22em" }}>
        {label}
      </div>
    </div>
  );
}

/* Full-bleed US silhouette footer — map fills card width, no wasted space. */
function USOutlineMetric() {
  return (
    <div className="relative px-5 pb-5 pt-2">
      <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="font-mono-tight text-[9.5px] text-acc-soft" style={{ letterSpacing: "0.22em" }}>
            COVERAGE · CONUS
          </div>
          <div className="font-display text-[13px] text-[var(--text)] leading-none">
            Nationwide
          </div>
        </div>

        {/* Map — fills full card width */}
        <div
          className="relative w-full text-[var(--acc)]"
          style={{
            aspectRatio: "1000 / 259",
            maskImage: "url(/us-states.svg)",
            WebkitMaskImage: "url(/us-states.svg)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--acc) 100%, transparent), color-mix(in oklab, var(--acc) 60%, transparent))",
            filter:
              "drop-shadow(0 0 10px color-mix(in oklab, var(--acc) 85%, transparent)) drop-shadow(0 0 22px color-mix(in oklab, var(--acc) 35%, transparent))",
            animation: "usFade 1.6s ease-out .3s both, usPulse 5s ease-in-out 2s infinite",
          }}
          aria-hidden
        />

        {/* Bottom hairline */}
        <div className="h-px mx-3" style={{ background: "linear-gradient(90deg, transparent, rgba(95,217,154,0.28), transparent)" }} />
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="font-mono-tight text-[9px] text-faint" style={{ letterSpacing: "0.2em" }}>
            48 STATES · CONTIGUOUS
          </span>
          <span className="flex items-center gap-1.5 font-mono-tight text-[9px] text-acc-soft" style={{ letterSpacing: "0.2em" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--acc)", boxShadow: "0 0 8px var(--acc)" }} />
            LIVE
          </span>
        </div>
      </div>
      <style>{`
        @keyframes usFade { from { opacity: 0; transform: translateY(2px) } to { opacity: .95; transform: none } }
        @keyframes usPulse { 0%,100% { opacity: .85 } 50% { opacity: 1 } }
      `}</style>
    </div>
  );
}


/* ---------------- Reveal helper ---------------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
      <div>
        <div className="font-mono-tight text-[11px] text-acc-soft mb-3">{index}</div>
        <h2 className="font-display text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-tight m-0">
          {title}
        </h2>
      </div>
      <div className="hairline flex-1 min-w-[120px] mb-3" />
    </div>
  );
}

/* ---------------- Approach ---------------- */
const APPROACH = [
  {
    n: "01",
    title: "Statistical Modeling",
    body: "Small-area estimation · multivariate analysis · sampling & design of experiments · optimization",
  },
  {
    n: "02",
    title: "Machine Learning",
    body: "Supervised & unsupervised learning · anomaly detection · deep learning & NLP · model explainability",
  },
  {
    n: "03",
    title: "Geospatial & Remote Sensing",
    body: "ArcGIS Pro & ArcPy · LiDAR acquisition & processing · ERDAS · ENVI · spatial modeling",
  },
  {
    n: "04",
    title: "Forestry & Carbon",
    body: "Forest biometrics · carrying-capacity models · forest carbon & REDD+ · natural-resource decisions",
  },
];
const STACK = ["Python", "R", "SAS", "SPSS", "Stata", "Plotly Dash", "ArcGIS Pro", "TensorFlow"];

function Approach() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section id="approach" className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 10%, rgba(95,217,154,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${topoContours})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.14,
          mixBlendMode: "screen",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%)",
        }}
      />
      <div
        ref={ref}
        className="relative max-w-[1280px] mx-auto"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(32px)",
          transition: "opacity .9s ease, transform .9s ease",
        }}
      >
        <SectionHeader index="01 · APPROACH" title="Field notes from a digital forest." />
        <p className="font-display italic text-[clamp(22px,2.4vw,32px)] max-w-[820px] leading-snug text-muted-fg mb-16">
          Forests are among the most complex systems we measure. I build the statistical and
          machine-learning tools that make sense of them — from a single field plot to a
          continent of LiDAR.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {APPROACH.map((a) => (
            <div
              key={a.n}
              className="glass group p-7 transition-transform duration-500 hover:-translate-y-1"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(95,217,154,0.02))" }}
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono-tight text-[10.5px] text-acc-soft">{a.n}</span>
                <span
                  className="dot-acc opacity-70 group-hover:opacity-100"
                  style={{ transition: "opacity .3s" }}
                />
              </div>
              <h3 className="font-display text-[28px] leading-tight mb-3">{a.title}</h3>
              <p className="text-[14.5px] leading-[1.7] text-muted-fg m-0">{a.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <span className="font-mono-tight text-[10.5px] text-faint mr-2">STACK —</span>
          {STACK.map((s) => (
            <span
              key={s}
              className="font-mono-tight text-[11px] text-acc-soft px-3 py-1.5 rounded-full border border-[rgba(159,240,192,0.18)] bg-[rgba(95,217,154,0.04)]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Experience ---------------- */
const ROLES = [
  {
    title: "Research Scientist II",
    when: "2024 — PRESENT",
    org: "Intermountain Forestry Cooperative, CNR · University of Idaho",
    body: "Lead Data Scientist for the cooperative — owning research deliverables for stakeholders (publications & grant writing) and mentoring graduate students.",
  },
  {
    title: "Postdoctoral Researcher",
    when: "04/2022 — 06/2024",
    org: "University of Idaho, Moscow, Idaho (USA)",
    body: "Led the National Center for Advanced Forestry Systems effort to build geospatial forest carrying-capacity models, dashboards, and LiDAR processing for forest-resource mapping & monitoring.",
  },
  {
    title: "Data Scientist",
    when: "05/2021 — 03/2022",
    org: "CyborgIntell Pvt. Ltd, Bangalore (India)",
    body: "Model explainability for black-box / neural networks, automatic outlier detection, feature-selection pipelines; premium-collection forecasting, cross-sell, credit-risk & customer-acquisition modeling.",
  },
  {
    title: "Teaching Assistant",
    when: "08/2017 — 01/2018",
    org: "Kerala Agricultural University, Thrissur (India)",
    body: "Instruction and lab support across agricultural statistics curricula.",
  },
];

function Experience() {
  return (
    <section
      id="experience"
      className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]"
      style={{ background: "linear-gradient(180deg, var(--forest-bg), var(--forest-bg-2))" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="02 · EXPERIENCE" title="A decade between code and canopy." />
        <ol className="relative">
          <span
            aria-hidden
            className="absolute left-[10px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(180deg, var(--acc), transparent)" }}
          />
          {ROLES.map((r) => (
            <TimelineItem key={r.title + r.when} {...r} />
          ))}
        </ol>
      </div>
    </section>
  );
}
function TimelineItem({ title, when, org, body }: (typeof ROLES)[number]) {
  const { ref, shown } = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="relative pl-10 py-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-8 gap-y-3 border-b border-white/5 last:border-b-0"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transition: "opacity .7s, transform .7s",
      }}
    >
      <span
        aria-hidden
        className="absolute left-[6px] top-9 w-2.5 h-2.5 rounded-full"
        style={{ background: "var(--acc)", boxShadow: "0 0 12px var(--acc)" }}
      />
      <div className="min-w-0">
        <h3 className="font-display text-[clamp(26px,3.4vw,40px)] leading-tight m-0">{title}</h3>
        <div className="font-mono-tight text-[11px] text-acc-soft mt-2">{org}</div>
        <p className="mt-3 text-[14.5px] leading-[1.7] text-muted-fg max-w-[760px] m-0">{body}</p>
      </div>
      <div className="font-mono-tight text-[11px] text-faint md:text-right md:pt-2">{when}</div>
    </li>
  );
}

/* ---------------- Grants ---------------- */
const GRANTS = [
  {
    role: "PRINCIPAL INVESTIGATOR",
    src: "USFS-FIA / NCASI / CAFS · 2024–2026",
    title: "Robust small-area estimation strategies for accurate stand-level diameter distributions",
    amount: "$180K",
  },
  {
    role: "CO-PRINCIPAL INVESTIGATOR",
    src: "USDA-NRCS · 2024–2026",
    title: "NRCS Soils2026 Digital Forestry — estimating site index from 3D-NAIP & 3DEP LiDAR",
    amount: "$350K",
  },
  {
    role: "KEY PERSONNEL",
    src: "USDA Forest Service, PNW Region · 2024–2028",
    title: "Site-specific stand management best practices",
    amount: "$224K",
  },
  {
    role: "KEY PERSONNEL",
    src: "NSF-IUCRC, Center for Advanced Forestry Systems · 2022–2024",
    title: "Assessing & mapping regional variation in potential site carrying capacity",
    amount: "$150K",
  },
];

function Grants() {
  return (
    <section id="grants" className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="03 · GRANTS & FUNDING" title="Over $900K secured across four projects." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GRANTS.map((g) => (
            <GrantCard key={g.title} {...g} />
          ))}
        </div>
      </div>
    </section>
  );
}
function GrantCard({ role, src, title, amount }: (typeof GRANTS)[number]) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="glass-strong p-7 relative overflow-hidden group"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .7s, transform .7s",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full opacity-30 blur-3xl group-hover:opacity-50 transition-opacity"
        style={{ background: "radial-gradient(circle, var(--acc), transparent 70%)" }}
      />
      <div className="flex items-start justify-between gap-6 relative">
        <div className="min-w-0">
          <div className="font-mono-tight text-[10.5px] text-acc-soft mb-2">{role}</div>
          <div className="font-mono-tight text-[10.5px] text-faint mb-5">{src}</div>
          <h3 className="font-display text-[clamp(22px,2.4vw,28px)] leading-snug m-0">{title}</h3>
        </div>
        <div className="font-display text-[clamp(34px,4.6vw,52px)] text-acc leading-none whitespace-nowrap">
          {amount}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Education ---------------- */
const EDU = [
  {
    deg: "PhD",
    year: "2021",
    field: "Statistics",
    org: "CCS Haryana Agricultural University, Hisar, India",
    body: "Small-area estimation of crop yield using remote-sensing data",
  },
  {
    deg: "MSc",
    year: "2017",
    field: "Agricultural Statistics",
    org: "Kerala Agricultural University, Thrissur, India",
    body: "Profit-maximization model for Kerala homesteads",
  },
  {
    deg: "BSc",
    year: "2015",
    field: "Agricultural Sciences",
    org: "Acharya N.G. Ranga Agricultural University, Guntur, India",
    body: "ASRB National Eligibility Test (NET-II) qualified",
  },
];
function Education() {
  return (
    <section
      className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]"
      style={{ background: "linear-gradient(180deg, var(--forest-bg-2), var(--forest-bg))" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="04 · EDUCATION" title="Trained where statistics meets the soil." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EDU.map((e) => (
            <div key={e.deg} className="glass p-7 h-full">
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-display text-[44px] leading-none text-acc">{e.deg}</span>
                <span className="font-mono-tight text-[10.5px] text-faint">{e.year}</span>
              </div>
              <div className="font-display italic text-[22px] mb-2">{e.field}</div>
              <div className="font-mono-tight text-[10.5px] text-acc-soft mb-4">{e.org}</div>
              <p className="text-[14px] leading-[1.65] text-muted-fg m-0">{e.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Publications ---------------- */
const PUBS = [
  {
    t: "EBLUP estimate of crop yield at sub-district level in Hisar district using MODIS/Terra data",
    a: "Jaslam et al.",
    j: "Current Science · 2020",
  },
  {
    t: "Geologic soil parent-material influence on forest surface-soil chemistry in the Inland Northwest, USA",
    a: "Moore, J.A. et al.",
    j: "Forests (MDPI) · 2022 · IF 2.9",
  },
  {
    t: "Diversity structure analysis based on hierarchical clustering method",
    a: "Jaslam et al.",
    j: "AIP Conference Proceedings · 2022",
  },
  {
    t: "Analysis of unit-level models for small-area estimation in crop statistics assisted with satellite auxiliary information",
    a: "Jaslam et al.",
    j: "Model Assisted Statistics & Applications · 2023",
  },
  {
    t: "Association mapping of drought tolerance and agronomic traits in rice (Oryza sativa L.) landraces",
    a: "Beena, R. et al.",
    j: "BMC Plant Biology · 2021 · IF 4.2",
  },
];

function Publications() {
  return (
    <section id="publications" className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="05 · PUBLICATIONS" title="A growing record of peer-reviewed work." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatCard big="22" label="research articles" />
          <StatCard big="2" label="books" />
          <StatCard big="2" label="book chapters" />
        </div>
        <ul className="divide-y divide-white/5">
          {PUBS.map((p) => (
            <PubItem key={p.t} {...p} />
          ))}
        </ul>
        <div className="mt-10 flex justify-between items-center flex-wrap gap-4">
          <div className="font-mono-tight text-[10.5px] text-faint">
            REVIEWER · Springer Nature · IOS Press
          </div>
          <a
            href="https://scholar.google.co.in/citations?user=arO7QMUAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className="font-mono-tight text-[11px] text-acc hover:text-acc-soft transition"
          >
            ALL 22 PUBLICATIONS ON SCHOLAR ↗
          </a>
        </div>
      </div>
    </section>
  );
}
function StatCard({ big, label }: { big: string; label: string }) {
  return (
    <div className="glass p-6 flex items-baseline gap-4">
      <span className="font-display text-[56px] leading-none text-acc">{big}</span>
      <span className="font-mono-tight text-[11px] text-faint uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}
function PubItem({ t, a, j }: { t: string; a: string; j: string }) {
  const { ref, shown } = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="py-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 group cursor-default"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: "opacity .6s, transform .6s",
      }}
    >
      <div className="min-w-0">
        <h3 className="font-display text-[clamp(18px,1.8vw,22px)] leading-snug m-0 group-hover:text-acc-soft transition-colors">
          {t}
        </h3>
        <div className="font-mono-tight text-[10.5px] text-faint mt-2">
          {a} &nbsp;·&nbsp; {j}
        </div>
      </div>
      <span className="font-mono-tight text-[11px] text-acc self-center">↗</span>
    </li>
  );
}

/* ---------------- Awards ---------------- */
const AWARDS = [
  ["2024", "IIDS Generative AI Fellow", "University of Idaho"],
  ["2024", "Member, American Statistical Association", "ASA"],
  ["2024", "AAAS Silver Membership", "American Association for the Advancement of Science"],
  ["2020", "Best Research Scholar Award", "DBT, Government of India"],
  ["2019", "Outstanding M.Sc. Thesis Award", "Madhumitha Foundation"],
  ["2019 · 2020", "Best Oral & Poster Presentations", "FOCUS 2019 · NCASM-20"],
];
function Awards() {
  return (
    <section
      className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]"
      style={{ background: "linear-gradient(180deg, var(--forest-bg), var(--forest-bg-2))" }}
    >
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="06 · AWARDS & HONORS" title="Recognized work, reviewed work." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {AWARDS.map(([yr, t, o]) => (
            <div
              key={t}
              className="grid grid-cols-[80px_1fr] gap-6 py-5 border-b border-white/5"
            >
              <span className="font-mono-tight text-[11px] text-acc-soft pt-1">{yr}</span>
              <div>
                <div className="font-display text-[22px] leading-tight">{t}</div>
                <div className="font-mono-tight text-[10.5px] text-faint mt-1">{o}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 glass p-6">
          <div className="font-mono-tight text-[10.5px] text-acc-soft mb-3">PEER REVIEWER</div>
          <p className="text-[14.5px] leading-[1.7] text-muted-fg m-0">
            Scientific Reports (Springer Nature) · Model Assisted Statistics and Applications
            (IOS Press) · International Journal of Agriculture Sciences · SCIENCEDOMAIN
            International journals
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Certifications ---------------- */
const CERTS = [
  ["AI Fluency: Framework & Foundations", "Anthropic · 26"],
  ["AI-Powered Higher Education", "Arizona State · 26"],
  ["Forest Carbon Credits & Initiatives", "Michigan State · 24"],
  ["Fundamentals on REDD+", "UN CC:Learn · 24"],
  ["Carbon Footprint & Carbon Accounting", "SIGMAEARTH · 24"],
  ["Biomedical Comprehensive", "CITI Program · 23"],
  ["ArcPy for Python Developers (ArcGIS Pro)", "Udemy · 23"],
  ["Working with LiDAR in ArcGIS Pro", "Idaho State · 22"],
  ["Interactive Python Dashboards — Plotly Dash", "Udemy · 22"],
  ["Deep Learning: NLP with TensorFlow", "LinkedIn · 22"],
  ["Remote Sensing in Crop Monitoring", "IIRS / ISRO · 20"],
  ["Machine Learning & Its Applications (FDP)", "IIT Roorkee · 20"],
];
function Certifications() {
  return (
    <section className="relative px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,160px)]">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader index="07 · CERTIFICATIONS" title="15+ credentials across AI, geospatial, and carbon." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CERTS.map(([t, o]) => (
            <div
              key={t}
              className="glass px-5 py-4 flex items-start justify-between gap-3 hover:-translate-y-0.5 transition-transform"
            >
              <span className="text-[14px] leading-snug">{t}</span>
              <span className="font-mono-tight text-[10px] text-faint whitespace-nowrap pt-1">
                {o}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  return (
    <section
      id="contact"
      className="relative px-[clamp(20px,5vw,80px)] py-[clamp(100px,16vh,200px)] overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--forest-bg-2), #03070500)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${forestMist})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.35,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,11,8,0.55) 0%, rgba(6,11,8,0.35) 50%, rgba(6,11,8,0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 60%, rgba(95,217,154,0.10), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1100px] mx-auto text-center">
        <div className="font-mono-tight text-[11px] text-acc-soft mb-6">08 · CONTACT</div>
        <h2 className="font-display text-[clamp(48px,8vw,120px)] leading-[0.95] m-0">
          Let's build something <span className="italic text-acc">that lasts.</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <ContactCard label="EMAIL">
            <a href="mailto:mjaslam@uidaho.edu" className="block text-acc-soft hover:text-acc">
              mjaslam@uidaho.edu
            </a>
            <a
              href="mailto:pkjaslamagrico@gmail.com"
              className="block text-acc-soft hover:text-acc mt-1"
            >
              pkjaslamagrico@gmail.com
            </a>
          </ContactCard>
          <ContactCard label="PHONE">
            <a href="tel:+12247229413" className="text-acc-soft hover:text-acc">
              +1 224-722-9413
            </a>
          </ContactCard>
          <ContactCard label="BASED IN">
            College of Natural Resources, University of Idaho, Moscow, ID 83843
          </ContactCard>
        </div>
      </div>
    </section>
  );
}
function ContactCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong p-7">
      <div className="font-mono-tight text-[10.5px] text-faint mb-3">{label}</div>
      <div className="text-[15px] leading-[1.7]">{children}</div>
    </div>
  );
}

/* ---------------- Footer ---------------- */
function SiteFooter() {
  return (
    <footer className="px-[clamp(20px,5vw,80px)] py-10 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="dot-acc" />
          <span className="font-mono-tight text-[11px] text-faint">
            © 2026 JASLAM POOLAKKAL, PhD
          </span>
        </div>
        <div className="flex gap-5 font-mono-tight text-[11px]">
          {[
            ["LINKEDIN", "https://www.linkedin.com/in/jaslampk/"],
            ["SCHOLAR", "https://scholar.google.co.in/citations?user=arO7QMUAAAAJ&hl=en"],
            ["RESEARCHGATE", "https://www.researchgate.net/profile/Muhammed-P-K-2"],
          ].map(([l, h]) => (
            <a
              key={l}
              href={h}
              target="_blank"
              rel="noreferrer"
              className="text-faint hover:text-[var(--text)] transition"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
