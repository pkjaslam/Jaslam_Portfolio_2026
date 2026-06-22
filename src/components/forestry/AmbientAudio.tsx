import { useEffect, useRef, useState } from "react";

/**
 * Procedural ambient sound engine for the portfolio.
 * Four crossfading layers (drone / pad / shimmer / wind), each tied to scroll position.
 * Pure Web Audio API — no assets, no network.
 * Off by default for accessibility & browser autoplay compliance.
 */

type Layer = "drone" | "pad" | "shimmer" | "wind";

// Mix per scroll-zone (0..1 of doc height). Each row sums to a calm total volume.
// Hero → contact moves from low drone → fuller pad → bright shimmer → soft wind tail.
const MIX: { at: number; m: Record<Layer, number> }[] = [
  { at: 0.0, m: { drone: 0.55, pad: 0.0, shimmer: 0.05, wind: 0.25 } },
  { at: 0.18, m: { drone: 0.45, pad: 0.25, shimmer: 0.1, wind: 0.2 } },
  { at: 0.38, m: { drone: 0.3, pad: 0.5, shimmer: 0.18, wind: 0.18 } },
  { at: 0.6, m: { drone: 0.22, pad: 0.4, shimmer: 0.35, wind: 0.16 } },
  { at: 0.82, m: { drone: 0.35, pad: 0.28, shimmer: 0.22, wind: 0.3 } },
  { at: 1.0, m: { drone: 0.5, pad: 0.15, shimmer: 0.1, wind: 0.4 } },
];

function sampleMix(p: number): Record<Layer, number> {
  let i = 0;
  while (i < MIX.length - 1 && MIX[i + 1].at < p) i++;
  const a = MIX[i];
  const b = MIX[Math.min(i + 1, MIX.length - 1)];
  const span = Math.max(0.0001, b.at - a.at);
  const t = Math.max(0, Math.min(1, (p - a.at) / span));
  return {
    drone: a.m.drone + (b.m.drone - a.m.drone) * t,
    pad: a.m.pad + (b.m.pad - a.m.pad) * t,
    shimmer: a.m.shimmer + (b.m.shimmer - a.m.shimmer) * t,
    wind: a.m.wind + (b.m.wind - a.m.wind) * t,
  };
}

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  layers: Record<Layer, GainNode>;
  shimmerTrigger: ReturnType<typeof setInterval> | null;
  cleanup: () => void;
};

function buildEngine(): Engine {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0; // fade in on unmute
  master.connect(ctx.destination);

  const makeLayer = () => {
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(master);
    return g;
  };
  const layers: Record<Layer, GainNode> = {
    drone: makeLayer(),
    pad: makeLayer(),
    shimmer: makeLayer(),
    wind: makeLayer(),
  };

  /* ---------- Drone: two low sines through a lowpass ---------- */
  const droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 320;
  droneFilter.Q.value = 0.7;
  droneFilter.connect(layers.drone);
  const droneOscs = [55, 82.5].map((f) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const og = ctx.createGain();
    og.gain.value = 0.35;
    o.connect(og).connect(droneFilter);
    o.start();
    return o;
  });

  /* ---------- Pad: detuned saw chord, slow LFO on filter ---------- */
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 600;
  padFilter.Q.value = 1.4;
  padFilter.connect(layers.pad);
  const padOscs = [220, 277.18, 329.63, 440].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 3 ? "triangle" : "sawtooth";
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 6;
    const og = ctx.createGain();
    og.gain.value = 0.07;
    o.connect(og).connect(padFilter);
    o.start();
    return o;
  });
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 280;
  lfo.connect(lfoGain).connect(padFilter.frequency);
  lfo.start();

  /* ---------- Wind: filtered white noise ---------- */
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 700;
  windFilter.Q.value = 0.4;
  const windLfo = ctx.createOscillator();
  windLfo.frequency.value = 0.09;
  const windLfoGain = ctx.createGain();
  windLfoGain.gain.value = 400;
  windLfo.connect(windLfoGain).connect(windFilter.frequency);
  windLfo.start();
  noise.connect(windFilter).connect(layers.wind);
  noise.start();

  /* ---------- Shimmer: occasional high triangle pings with envelope ---------- */
  const shimmerBus = ctx.createGain();
  shimmerBus.gain.value = 1;
  const shimmerDelay = ctx.createDelay(1.0);
  shimmerDelay.delayTime.value = 0.32;
  const shimmerFeedback = ctx.createGain();
  shimmerFeedback.gain.value = 0.38;
  shimmerBus.connect(layers.shimmer);
  shimmerBus.connect(shimmerDelay);
  shimmerDelay.connect(shimmerFeedback);
  shimmerFeedback.connect(shimmerDelay);
  shimmerDelay.connect(layers.shimmer);

  const notes = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760];
  const shimmerTrigger = setInterval(() => {
    if (layers.shimmer.gain.value < 0.001) return;
    const o = ctx.createOscillator();
    o.type = "triangle";
    const f = notes[Math.floor(Math.random() * notes.length)];
    o.frequency.value = f * (Math.random() < 0.3 ? 2 : 1);
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    o.connect(g).connect(shimmerBus);
    o.start(now);
    o.stop(now + 1.7);
  }, 1400);

  const cleanup = () => {
    try {
      if (shimmerTrigger) clearInterval(shimmerTrigger);
      droneOscs.forEach((o) => o.stop());
      padOscs.forEach((o) => o.stop());
      lfo.stop();
      windLfo.stop();
      noise.stop();
      void ctx.close();
    } catch {
      /* noop */
    }
  };

  return { ctx, master, layers, shimmerTrigger, cleanup };
}

export function AmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const engineRef = useRef<Engine | null>(null);
  const rafRef = useRef<number>(0);

  // Load preference (but never auto-enable on first visit)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ambient:enabled");
      if (saved === "1") setEnabled(true);
    } catch {
      /* noop */
    }
  }, []);

  // Build / tear down engine
  useEffect(() => {
    if (!enabled) {
      const e = engineRef.current;
      if (e) {
        const t = e.ctx.currentTime;
        e.master.gain.cancelScheduledValues(t);
        e.master.gain.setValueAtTime(e.master.gain.value, t);
        e.master.gain.linearRampToValueAtTime(0, t + 0.4);
        const cleanup = e.cleanup;
        setTimeout(() => cleanup(), 500);
        engineRef.current = null;
      }
      return;
    }
    if (engineRef.current) return;
    try {
      const eng = buildEngine();
      engineRef.current = eng;
      // Resume context (required after user gesture) + gentle fade-in
      void eng.ctx.resume().then(() => {
        const t = eng.ctx.currentTime;
        eng.master.gain.cancelScheduledValues(t);
        eng.master.gain.setValueAtTime(0, t);
        eng.master.gain.linearRampToValueAtTime(0.18, t + 1.8);
        setReady(true);
      });
    } catch {
      setEnabled(false);
    }
  }, [enabled]);

  // Tear down on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  // Scroll-synced layer mix
  useEffect(() => {
    if (!enabled || !ready) return;
    let last = -1;
    const tick = () => {
      const eng = engineRef.current;
      if (eng) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (Math.abs(p - last) > 0.002) {
          last = p;
          const mix = sampleMix(p);
          const now = eng.ctx.currentTime;
          (Object.keys(mix) as Layer[]).forEach((k) => {
            const g = eng.layers[k].gain;
            g.cancelScheduledValues(now);
            g.setValueAtTime(g.value, now);
            g.linearRampToValueAtTime(mix[k], now + 0.6);
          });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, ready]);

  const toggle = () => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem("ambient:enabled", next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute ambient soundscape" : "Play ambient soundscape"}
      title={enabled ? "Mute ambient soundscape" : "Play ambient soundscape"}
      className="fixed z-[80] bottom-5 left-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-full cursor-pointer transition-all"
      style={{
        background: "rgba(8,18,13,0.72)",
        backdropFilter: "blur(14px) saturate(160%)",
        border: "1px solid rgba(159,240,192,0.22)",
        color: "var(--text)",
      }}
    >
      <SpeakerIcon on={enabled} />
      <span className="font-mono-tight text-[10px] tracking-[0.22em] hidden sm:inline" style={{ color: "var(--acc-soft)" }}>
        {enabled ? "AMBIENT · ON" : "AMBIENT · OFF"}
      </span>
      <Bars active={enabled && ready} />
    </button>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 6h2.2l3.4-2.6v9.2L4.7 10H2.5z" fill="currentColor" />
      {on ? (
        <>
          <path d="M10.8 5.4a3.6 3.6 0 0 1 0 5.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M12.6 3.8a6 6 0 0 1 0 8.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      ) : (
        <path d="M10.6 5.6l4 4M14.6 5.6l-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Bars({ active }: { active: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-3 w-[14px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: 2,
            background: "var(--acc)",
            borderRadius: 1,
            height: active ? "100%" : "20%",
            animation: active ? `eqbar 1.${i + 1}s ease-in-out ${i * 0.15}s infinite` : "none",
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
      <style>{`@keyframes eqbar { 0%,100%{height:25%} 50%{height:100%} }`}</style>
    </span>
  );
}