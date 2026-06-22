import { useEffect, useRef } from "react";

/**
 * Cinematic forest "neural canopy" — three depth-layered drift particles (LiDAR dust),
 * a connected node network, and flowing pulses, all on one Canvas 2D context.
 * Parallax-reactive to scroll & pointer. Respects prefers-reduced-motion.
 */
export function NodeNetworkCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    let scrollY = 0;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    type Dust = { x: number; y: number; z: number; vx: number; vy: number; r: number; a: number; hue: number };
    let nodes: Node[] = [];
    let pulses: { a: number; b: number; t: number; speed: number }[] = [];
    let dust: Dust[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(110, Math.max(48, Math.floor((w * h) / 16000)));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 1.1 + Math.random() * 1.6,
        hue: Math.random() < 0.12 ? 40 : 150,
      }));

      const dustCount = Math.min(260, Math.max(120, Math.floor((w * h) / 6500)));
      dust = Array.from({ length: dustCount }, () => {
        const z = Math.random(); // 0 = far, 1 = near
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: (Math.random() - 0.5) * (0.05 + z * 0.18),
          vy: -0.04 - z * 0.18 - Math.random() * 0.05,
          r: 0.4 + z * 1.6,
          a: 0.15 + z * 0.55,
          hue: Math.random() < 0.08 ? 40 : 150,
        };
      });
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const spawnPulse = () => {
      if (nodes.length < 2) return;
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      if (a === b) b = (b + 1) % nodes.length;
      pulses.push({ a, b, t: 0, speed: 0.004 + Math.random() * 0.008 });
      if (pulses.length > 22) pulses.shift();
    };

    const LINK_DIST = 130;
    let last = performance.now();
    let pulseTimer = 0;

    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 380) {
        pulseTimer = 0;
        spawnPulse();
      }

      ctx.clearRect(0, 0, w, h);

      // soft radial wash
      const wash = ctx.createRadialGradient(w * 0.78, h * 0.42, 0, w * 0.78, h * 0.42, Math.max(w, h) * 0.65);
      wash.addColorStop(0, "rgba(95,217,154,0.10)");
      wash.addColorStop(1, "rgba(95,217,154,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      // ---- depth-layered LiDAR dust (parallax on scroll + drift) ----
      for (const d of dust) {
        if (!reduce) {
          d.x += d.vx;
          d.y += d.vy;
        }
        if (d.y < -10) {
          d.y = h + 10;
          d.x = Math.random() * w;
        }
        if (d.x < -10) d.x = w + 10;
        else if (d.x > w + 10) d.x = -10;
        const py = d.y - scrollY * 0.05 * d.z; // parallax: near layer moves more
        ctx.beginPath();
        ctx.arc(d.x, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle =
          d.hue === 40
            ? `rgba(230,178,102,${d.a})`
            : `rgba(159,240,192,${d.a})`;
        ctx.fill();
      }

      // update + draw nodes
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          if (mouse.active) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 22000) {
              const f = (22000 - d2) / 22000;
              n.x += (dx / Math.sqrt(d2 + 1)) * f * 0.6;
              n.y += (dy / Math.sqrt(d2 + 1)) * f * 0.6;
            }
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hue === 40 ? "rgba(230,178,102,0.85)" : "rgba(159,240,192,0.85)";
        ctx.fill();
      }

      // links
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.28;
            ctx.strokeStyle = `rgba(95,217,154,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // pulses
      pulses = pulses.filter((p) => p.t < 1);
      for (const p of pulses) {
        p.t += p.speed * (dt / 16);
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grad.addColorStop(0, "rgba(159,240,192,0.95)");
        grad.addColorStop(1, "rgba(95,217,154,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
