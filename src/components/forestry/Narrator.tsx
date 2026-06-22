import { useEffect, useRef, useState } from "react";

/**
 * Cinematic narration system.
 *  - Prefetches every clip in parallel as soon as enabled, so playback starts instantly.
 *  - Triggers on first intersection (no long dwell) when the section is in view.
 *  - Fades old narration; never overlaps. One narration per section per session.
 *  - Mute persisted in localStorage.
 */

export type NarrationScript = {
  id: string;
  selector: string; // element id (without #) or "__hero__"
  text: string;
  subtitle?: string;
};

const SCRIPTS: NarrationScript[] = [
  {
    id: "hero",
    selector: "__hero__",
    text:
      "Hi, I'm Jaslam Poolakkal — most people call me JP. I work where forests, data, and artificial intelligence meet. Take your time. I'm glad you're here.",
    subtitle: "Hi, I'm Jaslam — JP. Welcome.",
  },
  {
    id: "approach",
    selector: "approach",
    text:
      "Forests don't come with labels. My work blends statistics, machine learning, and remote sensing to uncover the patterns hidden inside living systems.",
    subtitle: "Forests don't come with labels — patterns must be uncovered.",
  },
  {
    id: "experience",
    selector: "experience",
    text:
      "My path has moved between research, AI, and applied science. The goal stays the same — turning complexity into understanding.",
    subtitle: "Turning complexity into understanding.",
  },
  {
    id: "grants",
    selector: "grants",
    text: "Research becomes meaningful when ideas turn into action.",
    subtitle: "Research becomes meaningful when ideas turn into action.",
  },
  {
    id: "publications",
    selector: "publications",
    text: "Publications are milestones in an ongoing process of asking better questions.",
    subtitle: "Milestones in asking better questions.",
  },
  {
    id: "contact",
    selector: "contact",
    text:
      "Thanks for visiting. If something here connects with your work, I'd love to build something meaningful together.",
    subtitle: "Thanks for visiting — let's build together.",
  },
];

// Use sessionStorage so narration plays once per visit (not silenced forever after first load).
const PLAYED_KEY = "narrator:played:v4";
const ENABLED_KEY = "narrator:enabled";
const VOICE = "ash"; // warm, lower-register male

export function Narrator() {
  const [enabled, setEnabled] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const playedRef = useRef<Set<string>>(new Set());
  const currentRef = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cachePromisesRef = useRef<Map<string, Promise<string>>>(new Map());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ENABLED_KEY);
      if (stored !== null) setEnabled(stored === "1");
      const p = sessionStorage.getItem(PLAYED_KEY);
      if (p) playedRef.current = new Set(JSON.parse(p));
    } catch { /* noop */ }
  }, []);

  const fetchClip = (s: NarrationScript): Promise<string> => {
    const cached = cacheRef.current.get(s.id);
    if (cached) return Promise.resolve(cached);
    const inflight = cachePromisesRef.current.get(s.id);
    if (inflight) return inflight;
    const p = (async () => {
      const res = await fetch("/api/public/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: s.text, voice: VOICE }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(s.id, url);
      return url;
    })();
    cachePromisesRef.current.set(s.id, p);
    p.catch(() => cachePromisesRef.current.delete(s.id));
    return p;
  };

  // Prefetch every clip in PARALLEL so any section is ready instantly.
  useEffect(() => {
    if (!enabled) return;
    SCRIPTS.forEach((s) => { fetchClip(s).catch(() => {}); });
  }, [enabled]);

  const stopCurrent = (immediate = false) => {
    const a = audioRef.current;
    if (!a) {
      currentRef.current = null;
      setActiveId(null);
      return;
    }
    if (immediate) {
      a.pause();
      currentRef.current = null;
      setActiveId(null);
      return;
    }
    if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
    const startVol = a.volume;
    const startT = performance.now();
    const dur = 260;
    const step = () => {
      const t = Math.min(1, (performance.now() - startT) / dur);
      a.volume = startVol * (1 - t);
      if (t < 1) fadeRafRef.current = requestAnimationFrame(step);
      else {
        a.pause();
        a.volume = startVol;
        currentRef.current = null;
        setActiveId(null);
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  };

  const play = async (script: NarrationScript) => {
    if (!enabled) return;
    if (playedRef.current.has(script.id)) return;
    if (currentRef.current === script.id) return;

    stopCurrent(true);
    currentRef.current = script.id;
    setActiveId(script.id);

    try {
      const url = await fetchClip(script);
      if (currentRef.current !== script.id) return;
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.preload = "auto";
      audio.volume = 0;
      audio.onended = () => {
        playedRef.current.add(script.id);
        try { localStorage.setItem(PLAYED_KEY, JSON.stringify([...playedRef.current])); } catch { /* noop */ }
        currentRef.current = null;
        setActiveId(null);
      };
      await audio.play().catch(() => { /* autoplay blocked */ });
      const start = performance.now();
      const fadeIn = () => {
        const t = Math.min(1, (performance.now() - start) / 280);
        audio.volume = 0.92 * t;
        if (t < 1) requestAnimationFrame(fadeIn);
      };
      requestAnimationFrame(fadeIn);
    } catch {
      currentRef.current = null;
      setActiveId(null);
    }
  };

  // Hero narration once after enabling — wait for the splash to clear.
  useEffect(() => {
    if (!enabled) return;
    const hero = SCRIPTS.find((s) => s.id === "hero")!;
    if (!playedRef.current.has(hero.id)) {
      const t = setTimeout(() => play(hero), 3600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Intersection observer — fire AS SOON AS section enters viewport meaningfully.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els: { script: NarrationScript; el: Element }[] = [];
    SCRIPTS.forEach((s) => {
      if (s.selector === "__hero__") return;
      const el = document.getElementById(s.selector);
      if (el) els.push({ script: s, el });
    });
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible eligible entry.
        let bestScript: NarrationScript | null = null;
        let bestRatio = 0.18;
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (!e.isIntersecting) return;
          if (e.intersectionRatio < bestRatio) return;
          const s = SCRIPTS.find((x) => x.id === id);
          if (!s) return;
          if (playedRef.current.has(s.id)) return;
          bestRatio = e.intersectionRatio;
          bestScript = s;
        });
        if (bestScript && currentRef.current !== (bestScript as NarrationScript).id) {
          play(bestScript);
        }
      },
      { threshold: [0.18, 0.4, 0.7] }
    );
    els.forEach(({ el }) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
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
    <div className="fixed z-[80] bottom-5 right-5">
      <button
        type="button"
        onClick={toggleEnabled}
        aria-pressed={enabled}
        aria-label={enabled ? "Mute narration" : "Enable narration"}
        title={enabled ? "Mute narration" : "Enable narration"}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full cursor-pointer transition-all hover:bg-[rgba(8,18,13,0.92)]"
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
          {enabled ? (activeId ? "NARRATING" : "VOICE · ON") : "VOICE · OFF"}
        </span>
      </button>
    </div>
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
