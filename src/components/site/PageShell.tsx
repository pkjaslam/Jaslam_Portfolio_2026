import type { ReactNode } from "react";
import forestMist from "@/assets/forest-mist.jpg";
import topoContours from "@/assets/topo-contours.jpg";
import lidarCanopy from "@/assets/lidar-canopy.jpg";

type Mood = "forest" | "overlay" | "maps" | "data";

const MOOD_BG: Record<Mood, string> = {
  forest:
    "radial-gradient(70% 55% at 50% 28%, rgba(34,92,62,0.55), transparent 72%), radial-gradient(50% 40% at 20% 80%, rgba(18,46,32,0.5), transparent 70%), linear-gradient(180deg,#050a07 0%, #0a1612 60%, #06100b 100%)",
  overlay:
    "radial-gradient(70% 60% at 20% 30%, rgba(95,217,154,0.16), transparent 72%), radial-gradient(60% 50% at 80% 70%, rgba(230,178,102,0.09), transparent 72%), linear-gradient(180deg,#06100c 0%, #0a1a14 100%)",
  maps:
    "radial-gradient(80% 60% at 70% 30%, rgba(95,217,154,0.16), transparent 70%), radial-gradient(60% 50% at 20% 70%, rgba(72,140,180,0.18), transparent 75%), linear-gradient(180deg,#071612 0%, #0a1f1a 100%)",
  data:
    "radial-gradient(70% 55% at 50% 50%, rgba(95,217,154,0.18), transparent 70%), linear-gradient(180deg,#03080a 0%, #051410 60%, #03090b 100%)",
};

const MOOD_TEXTURE: Record<Mood, { url: string; opacity: number; blend?: string; filter?: string }> = {
  forest: { url: forestMist, opacity: 0.45, blend: "screen" },
  overlay: { url: lidarCanopy, opacity: 0.28, blend: "screen", filter: "saturate(0.7) hue-rotate(-10deg)" },
  maps: { url: topoContours, opacity: 0.36, blend: "screen" },
  data: { url: topoContours, opacity: 0.18, blend: "screen" },
};

export function PageShell({
  mood = "forest",
  eyebrow,
  title,
  lede,
  children,
}: {
  mood?: Mood;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  const tex = MOOD_TEXTURE[mood];
  return (
    <div className="relative min-h-screen text-[var(--text)]">
      {/* Atmosphere */}
      <div aria-hidden className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
        <div className="absolute inset-0" style={{ background: MOOD_BG[mood] }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${tex.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: tex.opacity,
            mixBlendMode: (tex.blend as any) ?? undefined,
            filter: tex.filter,
          }}
        />
        {(mood === "maps" || mood === "data") && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent 0 79px, rgba(95,217,154,0.06) 79px 80px), repeating-linear-gradient(0deg, transparent 0 79px, rgba(95,217,154,0.06) 79px 80px)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 100% at 50% 50%, transparent 55%, rgba(3,8,6,0.55) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative z-[5] pt-[clamp(120px,16vh,180px)] px-[clamp(20px,5vw,80px)] pb-[clamp(40px,6vh,80px)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono-tight text-[11px] text-acc-soft mb-4" style={{ letterSpacing: "0.28em" }}>
            {eyebrow.toUpperCase()}
          </div>
          <h1
            className="font-display font-normal leading-[0.96] tracking-[-0.012em] text-[clamp(40px,6.6vw,96px)] m-0"
            style={{ animation: "fadeUp .9s cubic-bezier(.2,.7,.2,1) .1s both" }}
          >
            {title}
          </h1>
          {lede && (
            <p
              className="mt-7 max-w-[720px] text-[clamp(15.5px,1.35vw,18px)] leading-[1.65] text-muted-fg"
              style={{ animation: "fadeUp .9s cubic-bezier(.2,.7,.2,1) .25s both" }}
            >
              {lede}
            </p>
          )}
          <div className="hairline mt-12" />
        </div>
      </header>

      {/* Body */}
      <main className="relative z-[5] px-[clamp(20px,5vw,80px)] pb-[clamp(80px,10vh,140px)]">
        <div className="max-w-[1280px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
