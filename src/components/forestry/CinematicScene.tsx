import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type ElementType } from "react";

/* ---------- shared rAF scroll subscription ---------- */
type Sub = () => void;
const subs = new Set<Sub>();
let rafId = 0;
let attached = false;

function schedule() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    for (const s of subs) s();
  });
}
function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}
export function subscribeScroll(fn: Sub) {
  attach();
  subs.add(fn);
  schedule();
  return () => {
    subs.delete(fn);
  };
}

/* ---------- per-element scroll progress (0 → 1 across viewport pass) ---------- */
export function useSceneProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the top edge meets the bottom of the viewport,
      // 1 when the bottom edge meets the top of the viewport.
      const raw = (vh - r.top) / (vh + r.height);
      setP(Math.max(0, Math.min(1, raw)));
    };
    const unsub = subscribeScroll(update);
    update();
    return unsub;
  }, []);
  return { ref, p };
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

type Cam = "rise" | "settle" | "drift" | "zoom" | "none";

/* ----------------------------------------------------------------------------
 * Cinematic scene: tight, controlled fade-in (0.85 → 1) between 10–35% of the
 * scene's viewport pass. Content never drops below 0.85, never exits to dark.
 * Optional subtle parallax/scale per camera variant — restrained, never showy.
 * ---------------------------------------------------------------------------- */
export function CinematicScene({
  children,
  className = "",
  style,
  camera = "settle",
  intensity = 1,
  as: As = "section",
  id,
}: {
  children: ReactNode | ((p: number) => ReactNode);
  className?: string;
  style?: CSSProperties;
  camera?: Cam;
  intensity?: number;
  as?: ElementType;
  id?: string;
}) {
  const { ref, p } = useSceneProgress<HTMLElement>();

  // Fade band: ramp 0 → 1 across p ∈ [0.10, 0.35], then hold.
  const ramp = easeOut((p - 0.1) / 0.25);
  const opacity = 0.85 + 0.15 * ramp; // floor 0.85, ceiling 1.0

  // Subtle camera move — ramps in across the same band and then holds steady.
  // Max ~6% travel (relative to section), max scale delta 0.02.
  const k = ramp;
  let tx = 0;
  let ty = 0;
  let scale = 1;

  switch (camera) {
    case "rise":
      ty = (1 - k) * 32 * intensity;
      scale = 1.0 + k * 0.012;
      break;
    case "drift":
      tx = (1 - k) * -22 * intensity;
      ty = (1 - k) * 10 * intensity;
      break;
    case "zoom":
      scale = 1.02 - k * 0.012;
      break;
    case "settle":
      ty = (1 - k) * 40 * intensity;
      scale = 1.0 + k * 0.008;
      break;
    case "none":
    default:
      break;
  }

  return (
    <As
      id={id}
      ref={ref as never}
      className={className}
      style={{
        ...style,
        opacity,
        transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
        transformOrigin: "center top",
        willChange: "transform, opacity",
      }}
    >
      {typeof children === "function" ? children(p) : children}
    </As>
  );
}

/* ----------------------------------------------------------------------------
 * SceneDivider: thin bg-foreground/20 rule that scales-X from the left as the
 * divider passes through the viewport. The elegant cinematic wipe — no curtain.
 * ---------------------------------------------------------------------------- */
export function SceneDivider({ label }: { label?: string }) {
  const { ref, p } = useSceneProgress<HTMLDivElement>();
  // Wipe progresses across p ∈ [0.25, 0.75]
  const wipe = easeOut((p - 0.25) / 0.5);
  const labelOpacity = Math.max(0, Math.min(1, (wipe - 0.15) / 0.55)) * 0.85;

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-[120px] overflow-hidden"
    >
      {label && (
        <span
          className="absolute left-[6%] top-1/2 -translate-y-[22px] font-mono-tight text-[10.5px]"
          style={{
            color: "var(--text)",
            opacity: labelOpacity,
            letterSpacing: "0.32em",
            transition: "opacity .2s linear",
          }}
        >
          {label}
        </span>
      )}
      <span
        className="absolute left-[6%] right-[6%] top-1/2 h-px bg-foreground/20"
        style={{
          transform: `scaleX(${wipe.toFixed(4)})`,
          transformOrigin: "left center",
          willChange: "transform",
        }}
      />
    </div>
  );
}
