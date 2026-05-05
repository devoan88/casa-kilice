import type { FaceZoneKey } from "@/lib/skinScan/faceZones";
import { faceZoneLabel } from "@/lib/skinScan/faceZones";

const ZONE_STYLE: Record<FaceZoneKey, { cx: number; cy: number; rx: number; ry: number; rot?: number }> = {
  t_zone: { cx: 100, cy: 78, rx: 38, ry: 52, rot: 0 },
  cheeks: { cx: 100, cy: 128, rx: 72, ry: 36, rot: 0 },
  under_eyes: { cx: 100, cy: 88, rx: 58, ry: 18, rot: 0 },
  perimeter: { cx: 100, cy: 132, rx: 56, ry: 62, rot: 0 },
};

export function FaceZoneDiagram({
  activeZones,
  variant,
}: {
  activeZones: FaceZoneKey[];
  variant: "light" | "dark";
}) {
  const faceStroke = variant === "dark" ? "rgba(232,224,216,0.55)" : "rgba(45,27,27,0.45)";
  const glow = variant === "dark" ? "rgba(201,162,110,0.45)" : "rgba(180,130,70,0.35)";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-muted">Face mapping</p>
      <svg viewBox="0 0 200 220" className="h-[200px] w-[160px] max-w-full" role="img" aria-label="Stylised face diagram with highlighted zones discussed in your protocol">
        <ellipse cx="100" cy="118" rx="72" ry="92" fill="none" stroke={faceStroke} strokeWidth="1.2" />
        <path
          d="M100 48 C 72 52 58 78 58 108 C 58 148 78 178 100 186 C 122 178 142 148 142 108 C 142 78 128 52 100 48 Z"
          fill="none"
          stroke={faceStroke}
          strokeWidth="1.2"
        />
        {activeZones.map((z) => {
          const s = ZONE_STYLE[z];
          return (
            <ellipse
              key={z}
              cx={s.cx}
              cy={s.cy}
              rx={s.rx}
              ry={s.ry}
              transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined}
              fill={glow}
              stroke="rgba(201,162,110,0.95)"
              strokeWidth={1.8}
            />
          );
        })}
      </svg>
      <ul className="max-w-[200px] space-y-1 text-center text-[10px] leading-snug text-muted">
        {activeZones.map((z) => (
          <li key={z} className="text-foreground/80">
            <span className="text-[color:var(--hermes)]">●</span> {faceZoneLabel(z)}
          </li>
        ))}
      </ul>
    </div>
  );
}
