import logoUidaho from "@/assets/logo-uidaho-mono.png";
import logoIfc from "@/assets/logo-ifc-mono.png";
import logoDfa from "@/assets/dfa-cream-logo.png.asset.json";
import logoPsae from "@/assets/logo-psae-mono.png";
import logoCafs from "@/assets/logo-cafs-mono.png";

/**
 * Affiliations panel. Transparent cream silhouettes float over the dark
 * forest backdrop. Row 1: UIdaho · IFC · DFA. Row 2: PSAE · CAFS.
 */
export function AffiliationsPanel() {
  const row1 = [
    { src: logoUidaho, label: "University of Idaho", scale: 1 },
    { src: logoIfc, label: "Intermountain Forestry Cooperative", scale: 1.35 },
    { src: logoDfa.url, label: "Digital Forest Affiliates", scale: 1.45 },
  ];
  const row2 = [
    { src: logoPsae, label: "Partnership for Small Area Estimation", scale: 1.6 },
    { src: logoCafs, label: "Center for Advanced Forestry Systems", scale: 1 },
  ];

  const Logo = ({ src, label, scale }: { src: string; label: string; scale: number }) => (
    <div className="relative flex items-center justify-center w-full h-[88px] sm:h-[100px] group">
      <img
        src={src}
        alt={label}
        loading="lazy"
        style={{
          maxWidth: `${100 * scale}%`,
          maxHeight: `${100 * scale}%`,
          width: "auto",
          height: "auto",
          objectFit: "contain",
          opacity: 0.9,
          filter: "drop-shadow(0 0 18px rgba(95,217,154,0.14))",
          transition: "opacity .5s ease, transform .5s ease",
        }}
        className="group-hover:opacity-100 group-hover:scale-[1.03]"
      />
    </div>
  );

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 50%, rgba(95,217,154,0.10), transparent 75%)",
          filter: "blur(8px)",
        }}
      />

      <div className="relative px-2 py-6">
        <div className="grid grid-cols-3 gap-5 items-center">
          {row1.map((it) => (<Logo key={it.label} {...it} />))}
        </div>
        <div className="grid grid-cols-2 gap-6 mt-5 items-center px-[8%]">
          {row2.map((it) => (<Logo key={it.label} {...it} />))}
        </div>
        <div className="hairline mt-7 opacity-60" />
      </div>
    </div>
  );
}
