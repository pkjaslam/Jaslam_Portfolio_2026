import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { PERSON } from "@/data/portfolio";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/research", label: "Research" },
  { to: "/tools", label: "Tools" },
  { to: "/publications", label: "Publications" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // On home, the cinematic page has its own scrolled nav — hide global one to avoid stacking.
  const visible = onHome ? false : true;

  return (
    <>
      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity .5s, transform .55s cubic-bezier(.2,.7,.2,1)",
          backdropFilter: "blur(20px) saturate(160%)",
          background: "rgba(6,11,8,.72)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
        className="flex items-center justify-between gap-4 px-[clamp(16px,4vw,56px)] py-3"
      >
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="dot-acc" />
          <span className="font-display text-[18px] leading-none truncate">Jaslam Poolakkal</span>
        </Link>

        <div className="hidden md:flex items-center gap-[clamp(10px,1.6vw,22px)]">
          {NAV.slice(1).map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="font-mono-tight text-[11px] transition-colors"
                style={{
                  color: active ? "var(--acc-soft)" : "var(--text-faint)",
                  letterSpacing: "0.18em",
                }}
              >
                {n.label.toUpperCase()}
              </Link>
            );
          })}
          <button
            onClick={() => setPaletteOpen(true)}
            className="font-mono-tight text-[10.5px] text-faint hover:text-acc-soft transition flex items-center gap-1.5 px-2 py-1 rounded border border-white/10"
            aria-label="Open command palette"
          >
            <span>⌘</span>K
          </button>
          <a
            href={PERSON.links.cv}
            target="_blank"
            rel="noreferrer"
            className="font-mono-tight text-[11px] text-[#04120a] bg-[var(--acc)] px-[14px] py-2 rounded-full hover:brightness-110 transition"
          >
            CV ↗
          </a>
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden font-mono-tight text-[11px] text-acc-soft border border-white/15 px-3 py-1.5 rounded-full"
        >
          MENU
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          style={{ background: "rgba(3,8,6,0.92)", backdropFilter: "blur(20px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 top-0 p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[20px]">Jaslam Poolakkal</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="font-mono-tight text-[11px] text-faint px-3 py-1.5 border border-white/15 rounded-full"
              >
                CLOSE
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-[28px] py-2 border-b border-white/5"
                  style={{ color: pathname === n.to ? "var(--acc-soft)" : "var(--text)" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <a
              href={PERSON.links.cv}
              target="_blank"
              rel="noreferrer"
              className="font-mono-tight text-[12px] text-[#04120a] bg-[var(--acc)] px-5 py-3 rounded-full text-center mt-4"
            >
              Download CV ↗
            </a>
            <button
              onClick={() => {
                setOpen(false);
                setPaletteOpen(true);
              }}
              className="font-mono-tight text-[11px] text-acc-soft border border-white/15 px-4 py-2.5 rounded-full"
            >
              Open command palette
            </button>
          </div>
        </div>
      )}

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </>
  );
}

function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to a section, tool, or publication…" />
      <CommandList>
        <CommandEmpty>Nothing here.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV.map((n) => (
            <CommandItem
              key={n.to}
              onSelect={() => {
                setOpen(false);
                window.location.assign(n.to);
              }}
            >
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => window.open(PERSON.links.cv, "_blank")}>
            Download CV
          </CommandItem>
          <CommandItem onSelect={() => window.open(PERSON.links.scholar, "_blank")}>
            Google Scholar
          </CommandItem>
          <CommandItem onSelect={() => window.open(PERSON.links.linkedin, "_blank")}>
            LinkedIn
          </CommandItem>
          <CommandItem onSelect={() => window.open(`mailto:${PERSON.email}`, "_self")}>
            Email Jaslam
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="relative z-[5] mt-32 px-[clamp(20px,5vw,80px)] py-12 border-t border-white/5"
      style={{ background: "linear-gradient(180deg, transparent, rgba(3,8,6,0.7))" }}
    >
      <div className="max-w-[1280px] mx-auto grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="dot-acc" />
            <span className="font-display text-[22px]">Jaslam Poolakkal</span>
          </div>
          <p className="text-[14px] text-muted-fg max-w-[360px] leading-relaxed">
            Data scientist building the operating system for forest decisions —
            statistics, machine learning, and LiDAR at landscape scale.
          </p>
        </div>
        <FooterCol title="Explore" links={NAV.slice(1, 5).map((n) => ({ label: n.label, to: n.to }))} />
        <FooterCol
          title="Elsewhere"
          links={[
            { label: "Google Scholar", href: PERSON.links.scholar },
            { label: "LinkedIn", href: PERSON.links.linkedin },
            { label: "ResearchGate", href: PERSON.links.researchgate },
          ]}
        />
        <FooterCol
          title="Reach"
          links={[
            { label: "Email", href: `mailto:${PERSON.email}` },
            { label: "Download CV", href: PERSON.links.cv },
            { label: "Moscow, Idaho", href: undefined },
          ]}
        />
      </div>
      <div className="hairline mt-12 mb-5" />
      <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3 font-mono-tight text-[10px] text-faint" style={{ letterSpacing: "0.22em" }}>
        <div>© {new Date().getFullYear()} JASLAM POOLAKKAL · ALL RIGHTS RESERVED</div>
        <div>46.73°N · 117.00°W · INTERMOUNTAIN FORESTRY COOPERATIVE</div>
      </div>
    </footer>
  );
}

type FLink = { label: string; to?: string; href?: string };
function FooterCol({ title, links }: { title: string; links: FLink[] }) {
  return (
    <div>
      <div className="font-mono-tight text-[10px] text-acc-soft mb-4" style={{ letterSpacing: "0.28em" }}>
        {title.toUpperCase()}
      </div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="text-[13px] text-muted-fg hover:text-acc-soft transition">
                {l.label}
              </Link>
            ) : l.href ? (
              <a
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="text-[13px] text-muted-fg hover:text-acc-soft transition"
              >
                {l.label}
              </a>
            ) : (
              <span className="text-[13px] text-faint">{l.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
