'use client';

// Tiny dependency-free sparkline. Null values (fouls) break the line and show
// as a hollow tick on the baseline, so a foul never looks like a 0 m throw.

interface SparklineProps {
  values: (number | null)[];
  label: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ values, label, width = 280, height = 56 }: SparklineProps) {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  const pad = 6;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const x = (i: number) => pad + (values.length === 1 ? (width - 2 * pad) / 2 : (i * (width - 2 * pad)) / (values.length - 1));
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - 2 * pad - 4);

  // Build path segments, breaking at fouls.
  let d = '';
  let pen = false;
  values.forEach((v, i) => {
    if (v === null) { pen = false; return; }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
    pen = true;
  });
  const bestIdx = values.findIndex((v) => v === max);

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {values.map((v, i) =>
        v === null ? (
          <line key={i} x1={x(i)} x2={x(i)} y1={height - 10} y2={height - 3} stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ) : i === bestIdx ? (
          <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        ) : null,
      )}
    </svg>
  );
}
