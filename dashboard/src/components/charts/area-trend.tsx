"use client";

import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Series = { key: string; color: string; dashed?: boolean; fill?: boolean; name?: string };

export function AreaTrend<T extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 120,
  showXAxis = false,
  grid = false,
  marker,
  yDomain,
  hLines,
  tooltip = true,
  unit = "",
}: {
  data: T[];
  series: Series[];
  xKey: keyof T & string;
  height?: number | `${number}%`;
  showXAxis?: boolean;
  grid?: boolean;
  /** indeks titik penanda "sekarang" */
  marker?: { index: number; key: string };
  yDomain?: [number | string, number | string];
  hLines?: { y: number; color: string }[];
  tooltip?: boolean;
  unit?: string;
}) {
  const id = series.map((s) => s.key).join("-");
  const m = marker ? data[marker.index] : undefined;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: typeof height === "number" ? height : 200 }}>
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`g-${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {grid && <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />}
          <XAxis
            dataKey={xKey as string}
            hide={!showXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#b3b6c9", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={40}
            tickMargin={10}
          />
          <YAxis hide domain={(yDomain ?? ["dataMin - 2", "dataMax + 2"]) as [number, number]} />
          {hLines?.map((l) => (
            <ReferenceLine key={l.y} y={l.y} stroke={l.color} strokeDasharray="5 5" strokeOpacity={0.7} />
          ))}
          {tooltip && (
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              contentStyle={{ background: "#272a3e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#b3b6c9" }}
              formatter={(v) => (typeof v === "number" ? `${Math.round(v * 100) / 100}${unit}` : String(v ?? "–"))}
            />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              name={s.name ?? s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "6 5" : undefined}
              fill={s.fill === false ? "transparent" : `url(#g-${id}-${s.key})`}
              connectNulls={false}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
          {m && marker && (
            <>
              <ReferenceLine x={m[xKey] as string | number} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 3" />
              <ReferenceDot x={m[xKey] as string | number} y={m[marker.key] as number} r={5} fill="#16172a" stroke="#fff" strokeWidth={2} />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
