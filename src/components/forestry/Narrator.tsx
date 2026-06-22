import { useEffect, useRef, useState } from "react";

/**
 * Cinematic narration system.
 *  - Trigger only after user dwells in a section for ~2s.
 *  - Skip narration if scroll velocity is high (fast scroll).
 *  - Fade old narration; never overlap.
 *  - One narration per section per session.
 *  - Hero plays once (after the user enables sound).
 *  - Mute persisted in localStorage. Subtitles always shown while narrating.
 */

export type NarrationScript = {
  id: string;
  selector: string; // element id (without #) or "__hero__"
  text: string;     // spoken text
  subtitle?: string; // visible subtitle (first line / short version)
  once?: boolean;
};

const SCRIPTS: NarrationScript[] = [
  {
    id: "hero",
    selector: "__hero__",
    text:
      "Hi, welcome. I'm Jaslam Poolakkal. Most people around here just call me JP. I work where forests, data, and artificial intelligence come together. Most days, that means turning LiDAR, satellite imagery, and field observations into ways of understanding forests a little better. This space is a collection of questions, ideas, and the landscapes that shaped them. A place where observations become models — and models become understanding. Take your time. I'm glad you're here. Let's explore.",
    subtitle:
      "Hi, I'm Jaslam — JP. Welcome to a place where observations become models, and models become understanding.",
  },
  {
    id: "approach",
    selector: "approach",
    text:
      "Forests don't come with labels. So my work combines statistics, machine learning, geospatial analysis, and forestry to uncover patterns hidden inside living systems.",
    subtitle:
      "Forests don't come with labels — patterns must be uncovered through statistics, ML, and geospatial science.",
  },
  {
    id: "experience",
    selector: "experience",
    text:
      "My path has moved between research, AI, and applied science. Across different environments, the goal stayed the same — transform complexity into understanding.",
    subtitle:
      "Research, AI, applied science — one goal: turn complexity into understanding.",
  },
  {
    id: "grants",
    selector: "grants",
    text:
      "Research becomes meaningful when ideas become action.",
    subtitle: "Research becomes meaningful when ideas become action.",
  },
  {
    id: "publications",
    selector: "publications",
    text:
      "Publications are milestones in an ongoing process of asking better questions.",
    subtitle:
      "Publications are milestones in an ongoing process of asking better questions.",
  },
  {
    id: "contact",
    selector: "contact",
    text:
      "Thanks for visiting. If something here connects with your work — I'd be glad to build something meaningful together.",
    subtitle:
      "Thanks for visiting. If something here connects with your work — let's build together.",
  },
];

const PLAYED_KEY = "narrator:played:v2";
const ENABLED_KEY = "narrator:enabled";

export function Narrator() {
  const [enabled, setEnabled] = useState(true);
  const [currentLine, setCurrentLine] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fadeRafRef = useRef<number>(0);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playedRef = useRef<Set<string>>(new Set());
  const visibleRef = useRef<string | null>(null);
  const currentNarrationRef = useRef<string | null>(null);
  // pre-cached audio blob URLs keyed by script id (instant playback, no "stuck")
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cachePromisesRef = useRef<Map<string, Promise<string>>>(new Map());
  // scroll velocity tracking
  const lastScrollY = useRef(0);
  const lastScrollT = useRef(0);
  const scrollVelRef = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ENABLED_KEY);
      if (stored !== null) setEnabled(stored === "1");
      const p = localStorage.getItem(PLAYED_KEY);
      if (p) playedRef.current = new Set(JSON.parse(p));
    } catch { /* noop */ }
  }, []);

  // Track scroll velocity (px/ms)
  useEffect(() => {
    if (typeof window === "undefined") return;
    lastScrollY.current = window.scrollY;
    lastScrollT.current = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      const dt = Math.max(1, now - lastScrollT.current);
      scrollVelRef.current = scrollVelRef.current * 0.6 + (dy / dt) * 0.4;
      lastScrollY.current = window.scrollY;
      lastScrollT.current = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prefetch & cache every narration once enabled so playback is instantaneous.
  // This eliminates the "stuck waiting for audio" issue.
  const fetchClip = (script: NarrationScript): Promise<string> => {
    const cached = cacheRef.current.get(script.id);
    if (cached) return Promise.resolve(cached);
    const inflight = cachePromisesRef.current.get(script.id);
    if (inflight) return inflight;
    const p = (async () => {
      const res = await fetch("/api/public/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script.text, voice: "ash" }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(script.id, url);
      return url;
    })();
    cachePromisesRef.current.set(script.id, p);
    p.catch(() => cachePromisesRef.current.delete(script.id));
    return p;
  };

  useEffect(() => {
    if (!enabled) return;
    // sequentially prefetch (hero first, then the rest) so we don't hammer the
    // gateway and so the first clip is ready as fast as possible.
    let cancelled = false;
    (async () => {
      for (const s of SCRIPTS) {
        if (cancelled) return;
        try { await fetchClip(s); } catch { /* swallow, will retry on play */ }
      }
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  const stopCurrent = (immediate = false) => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const a = audioRef.current;
    if (!a) {
      setActiveId(null);
      setCurrentLine("");
      currentNarrationRef.current = null;
      return;
    }
    if (immediate) {
      a.pause();
      currentNarrationRef.current = null;
      setActiveId(null);
      setCurrentLine("");
      return;
    }
    if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
    const startVol = a.volume;
    const startT = performance.now();
    const dur = 320;
    const step = () => {
      const t = Math.min(1, (performance.now() - startT) / dur);
      a.volume = startVol * (1 - t);
      if (t < 1) fadeRafRef.current = requestAnimationFrame(step);
      else {
        a.pause();
        a.volume = startVol;
        currentNarrationRef.current = null;
        setActiveId(null);
        setCurrentLine("");
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  };

  const play = async (script: NarrationScript) => {
    if (!enabled) return;
    if (playedRef.current.has(script.id)) return;
    if (currentNarrationRef.current === script.id) return;

    stopCurrent(true);
    currentNarrationRef.current = script.id;
    setActiveId(script.id);
    setCurrentLine(script.subtitle || script.text);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const url = await fetchClip(script);
      if (ctrl.signal.aborted || currentNarrationRef.current !== script.id) return;
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.preload = "auto";
      audio.volume = 0;
      audio.onended = () => {
        playedRef.current.add(script.id);
        try {
          localStorage.setItem(PLAYED_KEY, JSON.stringify([...playedRef.current]));
        } catch { /* noop */ }
        currentNarrationRef.current = null;
        setActiveId(null);
        setCurrentLine("");
      };
      await audio.play().catch(() => { /* autoplay blocked */ });
      const start = performance.now();
      const fadeIn = () => {
        const t = Math.min(1, (performance.now() - start) / 350);
        audio.volume = 0.9 * t;
        if (t < 1) requestAnimationFrame(fadeIn);
      };
      requestAnimationFrame(fadeIn);
    } catch {
      currentNarrationRef.current = null;
      setActiveId(null);
      setCurrentLine("");
    }
  };

  // Hero narration once after enabling — wait until splash has cleared
  useEffect(() => {
    if (!enabled) return;
    const hero = SCRIPTS.find((s) => s.id === "hero")!;
    if (!playedRef.current.has(hero.id)) {
      const t = setTimeout(() => play(hero), 1200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // IO + dwell + fast-scroll guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els: { script: NarrationScript; el: Element }[] = [];
    SCRIPTS.forEach((s) => {
      if (s.selector === "__hero__") return;
      const el = document.getElementById(s.selector);
      if (el) els.push({ script: s, el });
    });
    if (!els.length) return;

    const visible = new Map<string, number>();

    const armDwell = (id: string) => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = setTimeout(() => {
        if (visibleRef.current !== id) return;
        // skip if user is scrolling fast (> 1.2 px/ms ≈ flicking through)
        if (scrollVelRef.current > 1.2) return;
        const s = SCRIPTS.find((x) => x.id === id);
        if (s) play(s);
      }, 1100);
    };

    const recompute = () => {
      let bestId: string | null = null;
      let bestRatio = 0.3;
      visible.forEach((r, id) => {
        if (r > bestRatio) { bestRatio = r; bestId = id; }
      });
      if (bestId !== visibleRef.current) {
        visibleRef.current = bestId;
        if (currentNarrationRef.current && currentNarrationRef.current !== bestId) {
          stopCurrent(false);
        }
        if (bestId && enabled && !playedRef.current.has(bestId)) {
          armDwell(bestId);
        } else if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current);
          dwellTimerRef.current = null;
        }
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting) visible.set(id, e.intersectionRatio);
          else visible.delete(id);
        });
        recompute();
      },
      { threshold: [0, 0.25, 0.5, 0.75] }
    );
    els.forEach(({ el }) => io.observe(el));
    return () => {
      io.disconnect();
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  const toggleEnabled = () => {
    setEnabled((v) => {
      const next = !v;
      try { localStorage.setItem(ENABLED_KEY, next ? "1" : "0"); } catch { /* noop */ }
      if (!next) stopCurrent(false);
      return next;
    });
  };

  return (
    <>
      {/* subtitles intentionally disabled per user preference */}



      <div className="fixed z-[80] bottom-5 right-5">
        <button
          type="button"
          onClick={toggleEnabled}
          aria-pressed={enabled}
          aria-label={enabled ? "Mute narration" : "Enable narration"}
          title={enabled ? "Mute cinematic narration" : "Enable cinematic narration"}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full cursor-pointer transition-all"
          style={{
            background: "rgba(8,18,13,0.72)",
            backdropFilter: "blur(14px) saturate(160%)",
            border: "1px solid rgba(159,240,192,0.22)",
            color: "var(--text)",
          }}
        >
          <SpeakerIcon on={enabled} active={!!activeId} />
          <span
            className="font-mono-tight text-[10px] hidden sm:inline"
            style={{ color: "var(--acc-soft)", letterSpacing: "0.22em" }}
          >
            {enabled ? (activeId ? "NARRATING" : "NARRATION · ON") : "NARRATION · OFF"}
          </span>
        </button>
      </div>
    </>
  );
}

function SpeakerIcon({ on, active }: { on: boolean; active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 6h2.2l3.4-2.6v9.2L4.7 10H2.5z" fill="currentColor" />
      {on ? (
        <>
          <path
            d="M10.8 5.4a3.6 3.6 0 0 1 0 5.2"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            style={active ? { animation: "blink 1.2s infinite" } : undefined}
          />
          <path d="M12.6 3.8a6 6 0 0 1 0 8.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      ) : (
        <path d="M10.6 5.6l4 4M14.6 5.6l-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      )}
    </svg>
  );
}
