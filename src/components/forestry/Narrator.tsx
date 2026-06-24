import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Cinematic narration system.
 *  - Uses premium AI speech when available, then falls back to browser speech if credits/autoplay fail.
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

const FALLBACK_VOICE_HINTS = [
  "ravi",
  "google uk english male",
  "microsoft david",
  "microsoft mark",
  "alex",
  "daniel",
  "male",
  "google us english",
];

function getBrowserNarrationVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    FALLBACK_VOICE_HINTS.map((hint) =>
      voices.find((voice) => voice.name.toLowerCase().includes(hint) && voice.lang.toLowerCase().startsWith("en"))
    ).find(Boolean) || voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || null
  );
}

export function Narrator() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [enabled, setEnabled] = useState(true);
  const [heroGateOpen, setHeroGateOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechCancelingRef = useRef(false);
  const fadeRafRef = useRef<number>(0);
  const playedRef = useRef<Set<string>>(new Set());
  const currentRef = useRef<string | null>(null);
  const heroIntroducedRef = useRef(false);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const cachePromisesRef = useRef<Map<string, Promise<string>>>(new Map());
  const ttsUnavailableRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ENABLED_KEY);
      if (stored !== null) setEnabled(stored === "1");
    } catch { /* noop */ }
  }, []);

  const fetchClip = (s: NarrationScript): Promise<string> => {
    if (ttsUnavailableRef.current) return Promise.reject(new Error("TTS unavailable"));
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
      if (!res.ok) {
        ttsUnavailableRef.current = true;
        throw new Error(`TTS ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      cacheRef.current.set(s.id, url);
      return url;
    })();
    cachePromisesRef.current.set(s.id, p);
    p.catch(() => cachePromisesRef.current.delete(s.id));
    return p;
  };

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


  const markComplete = (script: NarrationScript) => {
    playedRef.current.add(script.id);
    if (script.id === "hero") {
      heroIntroducedRef.current = true;
      setHeroGateOpen(true);
    }
    currentRef.current = null;
    setActiveId(null);
  };

  const resetCurrent = (script?: NarrationScript) => {
    if (!script || currentRef.current === script.id) {
      currentRef.current = null;
      setActiveId(null);
    }
  };

  const stopBrowserSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    speechCancelingRef.current = true;
    window.speechSynthesis.cancel();
    speechRef.current = null;
    window.setTimeout(() => {
      speechCancelingRef.current = false;
    }, 0);
  };

  const playBrowserSpeech = (script: NarrationScript) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

    stopBrowserSpeech();
    const utterance = new SpeechSynthesisUtterance(script.text);
    const voice = getBrowserNarrationVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 0.86;
    utterance.volume = 0.94;
    speechRef.current = utterance;
    currentRef.current = script.id;
    setActiveId(script.id);

    utterance.onend = () => {
      if (speechRef.current !== utterance) return;
      speechRef.current = null;
      markComplete(script);
    };
    utterance.onerror = () => {
      if (speechCancelingRef.current || speechRef.current !== utterance) return;
      speechRef.current = null;
      resetCurrent(script);
    };

    try {
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
      return true;
    } catch {
      speechRef.current = null;
      resetCurrent(script);
      return false;
    }
  };

  const stopCurrent = (immediate = false) => {
    stopBrowserSpeech();
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

  const play = async (script: NarrationScript, options: { interrupt?: boolean; preferBrowserSpeech?: boolean; force?: boolean } = {}) => {
    if (!enabled && !options.force) return false;
    if (playedRef.current.has(script.id)) return false;
    if (currentRef.current === script.id) return false;
    if (currentRef.current && !options.interrupt) return false;

    stopCurrent(true);
    if (options.preferBrowserSpeech) return playBrowserSpeech(script);

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
        markComplete(script);
      };
      try {
        await audio.play();
      } catch {
        // Browser autoplay policy blocked playback. Do not mark it played or leave the
        // narrator active; fall back to browser speech and retry hero on the next gesture.
        resetCurrent(script);
        return playBrowserSpeech(script);
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
      resetCurrent(script);
      return playBrowserSpeech(script);
    }
  };

  const mostVisibleHomeScript = () => {
    if (typeof window === "undefined") return null;
    let best: NarrationScript | null = null;
    let bestRatio = 0.18;
    SCRIPTS.forEach((script) => {
      if (script.selector === "__hero__" || playedRef.current.has(script.id)) return;
      const el = document.getElementById(script.selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, visible) / Math.max(1, Math.min(rect.height, window.innerHeight));
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = script;
      }
    });
    return best;
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

    const t = setTimeout(() => { void tryPlay(); }, 3600);
    const openGate = setTimeout(() => {
      heroIntroducedRef.current = true;
      setHeroGateOpen(true);
    }, 9000);

    // First user gesture unlocks speech. Use browser speech immediately here because
    // fetching AI audio after the gesture can lose the browser's media permission window.
    const onGesture = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('[data-narrator-control="true"]')) return;
      void play(hero, { interrupt: true, preferBrowserSpeech: true, force: true }).then((started) => {
        if (started) cleanup();
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("scroll", onGesture, { passive: true });

    return () => { cancelled = true; clearTimeout(t); clearTimeout(openGate); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Durable fallback: every real visitor action can start the correct narration directly.
  // This avoids browser autoplay blocks and keeps the final thank-you narration reachable.
  useEffect(() => {
    if (!enabled) return;
    const onGesture = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('[data-narrator-control="true"]')) return;
      if (currentRef.current) return;
      const hero = SCRIPTS.find((s) => s.id === "hero")!;
      if (pathname === "/" && !playedRef.current.has(hero.id)) {
        void play(hero, { interrupt: true, preferBrowserSpeech: true, force: true });
        return;
      }
      const routeScript = ROUTE_SCRIPTS[pathname];
      if (routeScript && !playedRef.current.has(routeScript.id)) {
        void play(routeScript, { interrupt: true, preferBrowserSpeech: true, force: true });
        return;
      }
      if (pathname === "/" && heroGateOpen) {
        const script = mostVisibleHomeScript();
        if (script) void play(script, { interrupt: true, preferBrowserSpeech: true, force: true });
      }
    };

    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("scroll", onGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pathname, heroGateOpen]);

  // Intersection observer — fire AS SOON AS section enters viewport meaningfully.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/" && !heroGateOpen) return;
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
  }, [enabled, pathname, heroGateOpen]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      stopBrowserSpeech();
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
    };
  }, []);

  const toggleEnabled = () => {
    const hero = SCRIPTS.find((s) => s.id === "hero")!;
    if (enabled) {
      if (activeId) return;
      const routeScript = ROUTE_SCRIPTS[pathname];
      const target =
        pathname === "/" && !playedRef.current.has(hero.id)
          ? hero
          : routeScript && !playedRef.current.has(routeScript.id)
            ? routeScript
            : pathname === "/"
              ? mostVisibleHomeScript()
              : null;
      if (target) void play(target, { interrupt: true, preferBrowserSpeech: true, force: true });
      return;
    }
    setEnabled((v) => {
      const next = !v;
      try { localStorage.setItem(ENABLED_KEY, next ? "1" : "0"); } catch { /* noop */ }
      if (!next) stopCurrent(false);
      else void play(hero, { interrupt: true, preferBrowserSpeech: true, force: true });
      return next;
    });
  };

  return (
    <div className="fixed z-[80] bottom-5 right-5">
      <button
        type="button"
        onClick={toggleEnabled}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        data-narrator-control="true"
        aria-pressed={enabled}
        aria-label={enabled ? (activeId ? "Mute narration" : "Play narration") : "Enable narration"}
        title={enabled ? (activeId ? "Mute narration" : "Play narration") : "Enable narration"}
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
          {enabled ? (activeId ? "NARRATING" : "PLAY VOICE") : "VOICE · OFF"}
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
