import { useEffect, useRef } from "react";

/**
 * SplashForestAmbience
 * --------------------
 * A short, cinematic, procedural forest soundscape that plays only while the
 * boot splash is on-screen. No assets, no network. Auto-fades out and
 * tears itself down when the splash hides. Replaces the old user-toggled
 * ambient soundscape entirely.
 *
 * Layers:
 *  - Warm Dmin9 sustained pad (the emotional bed)
 *  - Filtered noise wind that breathes
 *  - Sparse "bird"-like chirps (high triangle plinks with envelope)
 */
export function SplashForestAmbience({ active }: { active: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;
    stoppedRef.current = false;

    let started = false;
    const oscs: OscillatorNode[] = [];
    let chirpTimer: ReturnType<typeof setInterval> | null = null;
    let masterRef: GainNode | null = null;

    const begin = () => {
      if (started || stoppedRef.current) return;
      started = true;
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});

        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        masterRef = master;

        // --- low-pass that opens up ---
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;
        filter.Q.value = 0.7;
        filter.connect(master);

        const now = ctx.currentTime;

        // --- Pad (Dmin9): D2 A2 F3 C4 E4 ---
        const voices = [
          { f: 73.42, type: "sine" as OscillatorType, level: 0.32 },
          { f: 110.0, type: "sine" as OscillatorType, level: 0.2 },
          { f: 174.61, type: "triangle" as OscillatorType, level: 0.15 },
          { f: 261.63, type: "triangle" as OscillatorType, level: 0.1 },
          { f: 329.63, type: "sine" as OscillatorType, level: 0.08 },
        ];
        voices.forEach((v, i) => {
          [-6, +6].forEach((cents) => {
            const o = ctx.createOscillator();
            o.type = v.type;
            o.frequency.value = v.f;
            o.detune.value = cents;
            const g = ctx.createGain();
            g.gain.value = 0;
            o.connect(g).connect(filter);
            // slow vibrato
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.07 + i * 0.03;
            lfoGain.gain.value = 1.4;
            lfo.connect(lfoGain).connect(o.detune);
            const startT = now + i * 0.05;
            o.start(startT);
            lfo.start(startT);
            g.gain.setValueAtTime(0, startT);
            g.gain.linearRampToValueAtTime(v.level / 2, startT + 1.0);
            g.gain.linearRampToValueAtTime(v.level / 2.3, startT + 5.5);
            oscs.push(o, lfo);
          });
        });

        // --- Wind (filtered noise that breathes) ---
        const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = "bandpass";
        windFilter.frequency.value = 620;
        windFilter.Q.value = 0.4;
        const windGain = ctx.createGain();
        windGain.gain.value = 0;
        const windLfo = ctx.createOscillator();
        const windLfoGain = ctx.createGain();
        windLfo.frequency.value = 0.1;
        windLfoGain.gain.value = 300;
        windLfo.connect(windLfoGain).connect(windFilter.frequency);
        windLfo.start();
        noise.connect(windFilter).connect(windGain).connect(master);
        noise.start();
        windGain.gain.linearRampToValueAtTime(0.18, now + 1.4);
        oscs.push(windLfo);

        // --- Bird-like chirps every 1.4-2.8s (cap by splash length) ---
        const chirpNotes = [1567.98, 1760, 1975.53, 2349.32, 2637.02];
        chirpTimer = setInterval(() => {
          const c = ctxRef.current;
          if (!c) return;
          const t0 = c.currentTime;
          const f = chirpNotes[Math.floor(Math.random() * chirpNotes.length)];
          const o = c.createOscillator();
          o.type = "triangle";
          o.frequency.setValueAtTime(f * 0.92, t0);
          o.frequency.exponentialRampToValueAtTime(f * 1.05, t0 + 0.18);
          const g = c.createGain();
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(0.12, t0 + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
          o.connect(g).connect(master);
          o.start(t0);
          o.stop(t0 + 0.6);
        }, 1700);

        // master swell + filter sweep
        master.gain.setValueAtTime(0, now);
        master.gain.linearRampToValueAtTime(0.55, now + 1.2);
        master.gain.linearRampToValueAtTime(0.4, now + 4.0);
        filter.frequency.linearRampToValueAtTime(2200, now + 2.6);
        filter.frequency.linearRampToValueAtTime(900, now + 6.0);
      } catch {
        /* audio blocked */
      }
    };

    begin();
    const events = ["pointerdown", "pointermove", "touchstart", "keydown", "scroll", "wheel"];
    const onGesture = () => {
      begin();
      events.forEach((e) => window.removeEventListener(e, onGesture));
    };
    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));

    return () => {
      stoppedRef.current = true;
      events.forEach((e) => window.removeEventListener(e, onGesture));
      if (chirpTimer) clearInterval(chirpTimer);
      const ctx = ctxRef.current;
      if (ctx && masterRef) {
        try {
          const t = ctx.currentTime;
          masterRef.gain.cancelScheduledValues(t);
          masterRef.gain.setValueAtTime(masterRef.gain.value, t);
          masterRef.gain.linearRampToValueAtTime(0, t + 0.9);
        } catch { /* noop */ }
        setTimeout(() => {
          try { oscs.forEach((o) => o.stop()); } catch { /* noop */ }
          try { ctx.close(); } catch { /* noop */ }
        }, 1100);
      }
      ctxRef.current = null;
    };
  }, [active]);

  return null;
}
