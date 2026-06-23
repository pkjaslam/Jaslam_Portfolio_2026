import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

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
  audioUrl?: string;
};

const SCRIPTS: NarrationScript[] = [
  {
    id: "hero",
    selector: "__hero__",
    text:
      "Hey hi all, this is Jaslam Poolakkal — JP. Thank you for visiting my portfolio. Here we talk about artificial intelligence, machine learning, and forestry. Let's explore my projects, my publications, and the work behind them. I'm excited you're here, and excited to work with you all.",
    subtitle: "Hi, I'm Jaslam — JP. Welcome.",
    audioUrl: jaslamVoiceAsset.url,
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

// Per-route narration. Plays once per route per session, immediately on arrival.
const ROUTE_SCRIPTS: Record<string, NarrationScript> = {
  "/research": {
    id: "route-research",
    selector: "__route__",
    text: "Research, for me, is about listening to forests with the tools of statistics, machine learning, and remote sensing — and translating what they say into decisions.",
    subtitle: "Listening to forests with statistics, ML, and remote sensing.",
  },
  "/tools": {
    id: "route-tools",
    selector: "__route__",
    text: "These are the tools I build — small instruments that turn raw forest data into clear, defensible decisions on the ground.",
    subtitle: "Tools that turn raw forest data into clear decisions.",
  },
  "/publications": {
    id: "route-publications",
    selector: "__route__",
    text: "Each publication is a question answered carefully — a small, durable contribution to how we understand and manage living forests.",
    subtitle: "Each publication, a question answered carefully.",
  },
  "/impact": {
    id: "route-impact",
    selector: "__route__",
    text: "Impact, in this work, is measured in acres managed, decisions improved, and partners trusting the science behind the recommendations.",
    subtitle: "Acres, decisions, and trusted partnerships.",
  },
  "/about": {
    id: "route-about",
    selector: "__route__",
    text: "A short version of the path that brought me here — from statistics and agriculture to machine learning and forest intelligence.",
    subtitle: "From statistics to forest intelligence.",
  },
  "/contact": {
    id: "route-contact",
    selector: "__route__",
    text: "If something here resonates with your work, reach out. I'm always glad to start a conversation about forests, data, and what they can do together.",
    subtitle: "Glad to start a conversation.",
  },
};

const ENABLED_KEY = "narrator:enabled";
const VOICE = "ash"; // warm, lower-register male

export function Narrator() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [enabled, setEnabled] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number>(0);
  const playedRef = useRef<Set<string>>(new Set());
  const currentRef = useRef<string | null>(null);
  const heroIntroducedRef = useRef(false);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cachePromisesRef = useRef<Map<string, Promise<string>>>(new Map());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ENABLED_KEY);
      if (stored !== null) setEnabled(stored === "1");
    } catch { /* noop */ }
  }, []);

  const fetchClip = (s: NarrationScript): Promise<string> => {
    const cached = cacheRef.current.get(s.id);
    if (cached) return Promise.resolve(cached);
    if (s.audioUrl) {
      cacheRef.current.set(s.id, s.audioUrl);
      return Promise.resolve(s.audioUrl);
    }
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

  // Warm only the local hero recording. Generating every TTS clip on page load can exhaust credits
  // before the visitor reaches the section, which made narration feel random/unreliable.
  useEffect(() => {
    if (!enabled) return;
    const hero = SCRIPTS.find((s) => s.id === "hero");
    if (hero) fetchClip(hero).catch(() => {});
  }, [enabled]);

  // Per-route narration: play on arrival (and when pathname changes).
  useEffect(() => {
    if (!enabled) return;
    const script = ROUTE_SCRIPTS[pathname];
    if (!script) return;
    if (playedRef.current.has(script.id)) return;
    // Small delay so route transition settles.
    const t = setTimeout(() => { if (!playedRef.current.has(script.id)) play(script); }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pathname, activeId]);


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

  const play = async (script: NarrationScript, options: { interrupt?: boolean } = {}) => {
    if (!enabled) return false;
    if (playedRef.current.has(script.id)) return false;
    if (currentRef.current === script.id) return false;
    if (currentRef.current && !options.interrupt) return false;

    stopCurrent(true);
    currentRef.current = script.id;
    setActiveId(script.id);

    try {
      const url = await fetchClip(script);
      if (currentRef.current !== script.id) return false;
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.preload = "auto";
      audio.volume = 0;
      audio.onended = () => {
        playedRef.current.add(script.id);
        if (script.id === "hero") heroIntroducedRef.current = true;
        currentRef.current = null;
        setActiveId(null);
      };
      try {
        await audio.play();
      } catch {
        // Browser autoplay policy blocked playback. Do not mark it played or leave the
        // narrator active; the hero effect will retry on the next user gesture.
        currentRef.current = null;
        setActiveId(null);
        return false;
      }
      const start = performance.now();
      const fadeIn = () => {
        const t = Math.min(1, (performance.now() - start) / 280);
        audio.volume = 0.92 * t;
        if (t < 1) requestAnimationFrame(fadeIn);
      };
      requestAnimationFrame(fadeIn);
      return true;
    } catch {
      currentRef.current = null;
      setActiveId(null);
      return false;
    }
  };

  // Hero narration once after enabling — wait for the splash to clear.
  // Also retry on first user gesture in case browser autoplay policy blocked the first attempt.
  useEffect(() => {
    if (!enabled) return;
    const hero = SCRIPTS.find((s) => s.id === "hero")!;
    if (playedRef.current.has(hero.id)) return;

    let cancelled = false;
    const tryPlay = () => {
      if (cancelled || playedRef.current.has(hero.id)) return Promise.resolve(false);
      return play(hero, { interrupt: true });
    };

    const t = setTimeout(() => { void tryPlay(); }, 2400);

    // First user gesture unlocks autoplay — retry then.
    const onGesture = () => { void tryPlay().then((started) => { if (started) cleanup(); }); };
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    window.addEventListener("touchstart", onGesture, { once: true });
    window.addEventListener("scroll", onGesture, { once: true, passive: true });

    return () => { cancelled = true; clearTimeout(t); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Intersection observer — fire AS SOON AS section enters viewport meaningfully.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/" && !heroIntroducedRef.current) return;
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
  }, [enabled, pathname]);

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
