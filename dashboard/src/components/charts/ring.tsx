/** Donut / ring SVG ringan (tanpa library). */
export function Ring({
  segments,
  size = 104,
  stroke = 12,
  gap = 2,
  children,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  /** jarak antar segmen dalam derajat */
  gap?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gapLen = segments.length > 1 ? (gap / 360) * c : 0;
  const offsets = segments.map((_, i) => segments.slice(0, i).reduce((a, x) => a + (x.value / total) * c, 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = Math.max(0, (s.value / total) * c - gapLen);
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[i]}
            />
          );
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
