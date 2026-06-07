'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LandingPoint } from '@/lib/types';
import { formatDistance, metersToFeet, type DistanceUnit } from '@/lib/units';
import { getChartTheme, heatStop, type ChartTheme } from '@/lib/theme';

interface SectorMapProps {
  sectorDepth: number; // meters
  points: LandingPoint[];
  distanceUnit?: DistanceUnit;
  onAddPoint?: (point: LandingPoint) => void;
  onRemovePoint?: (index: number) => void;
  readOnly?: boolean;
  colorMode?: 'default' | 'heatmap';
  overlayPoints?: LandingPoint[][];
  overlayColors?: string[];
  hideList?: boolean; // suppress the built-in points list (parent manages its own)
}

const SECTOR_ANGLE = 34.92;
const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 400;
const CIRCLE_RADIUS = 15;
const CIRCLE_Y = CANVAS_HEIGHT - 40;
const CIRCLE_X = CANVAS_WIDTH / 2;

export default function SectorMap({
  sectorDepth,
  points,
  distanceUnit = 'm',
  onAddPoint,
  onRemovePoint,
  readOnly = false,
  colorMode = 'default',
  overlayPoints,
  overlayColors,
  hideList = false,
}: SectorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(sectorDepth);

  const metersPerPixel = depth / (CIRCLE_Y - 30);

  // Screen-reader fallback: the canvas is invisible to AT, so summarize the
  // landing points (count, best, average) in plain text tied via aria.
  const ariaSummary = useMemo(() => {
    const all = overlayPoints ? overlayPoints.flat() : points;
    if (all.length === 0) {
      return 'Throw sector map. No landing points recorded.';
    }
    const dists = all.map((p) => p.distance);
    const best = Math.max(...dists);
    const avg = dists.reduce((a, b) => a + b, 0) / dists.length;
    return (
      `Throw sector map with ${all.length} landing point${all.length === 1 ? '' : 's'}. ` +
      `Best ${formatDistance(best, distanceUnit)}, ` +
      `average ${formatDistance(avg, distanceUnit)}, ` +
      `over a ${depth} meter sector.`
    );
  }, [overlayPoints, points, depth, distanceUnit]);

  const drawSector = useCallback((ctx: CanvasRenderingContext2D) => {
    const theme = getChartTheme();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background: ink-850 surface in dark, paper surface in light.
    ctx.fillStyle = theme.surface;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sector lines
    const halfAngle = (SECTOR_ANGLE / 2) * (Math.PI / 180);
    const sectorLength = CIRCLE_Y - 20;

    ctx.strokeStyle = theme.ring;
    ctx.lineWidth = 1;

    // Left line
    ctx.beginPath();
    ctx.moveTo(CIRCLE_X, CIRCLE_Y);
    ctx.lineTo(
      CIRCLE_X - Math.sin(halfAngle) * sectorLength,
      CIRCLE_Y - Math.cos(halfAngle) * sectorLength
    );
    ctx.stroke();

    // Right line
    ctx.beginPath();
    ctx.moveTo(CIRCLE_X, CIRCLE_Y);
    ctx.lineTo(
      CIRCLE_X + Math.sin(halfAngle) * sectorLength,
      CIRCLE_Y - Math.cos(halfAngle) * sectorLength
    );
    ctx.stroke();

    // Distance rings (ink-600 in dark / border in light)
    ctx.strokeStyle = theme.ring;
    for (let d = 5; d <= depth; d += 5) {
      const r = d / metersPerPixel;
      ctx.beginPath();
      ctx.arc(CIRCLE_X, CIRCLE_Y, r, Math.PI + halfAngle, 2 * Math.PI - halfAngle);
      ctx.stroke();

      // Label (canvas stays metric geometry; label shows chosen unit, compact)
      if (d % 10 === 0) {
        ctx.fillStyle = theme.fgMuted;
        ctx.font = '10px var(--font-mono), monospace';
        const label = distanceUnit === 'ft' ? `${Math.round(metersToFeet(d))}'` : `${d}m`;
        ctx.fillText(label, CIRCLE_X + 3, CIRCLE_Y - r + 12);
      }
    }

    // Throwing circle
    ctx.beginPath();
    ctx.arc(CIRCLE_X, CIRCLE_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = theme.border;
    ctx.fill();
    ctx.strokeStyle = theme.fgMuted;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Determine the best (PB) point across whatever set is being drawn, so we
    // can render it in LIME. Default landing points draw white.
    const candidatePoints: LandingPoint[] = overlayPoints
      ? overlayPoints.flat()
      : points;
    let pbDistance = -Infinity;
    for (const p of candidatePoints) {
      if (p.distance > pbDistance) pbDistance = p.distance;
    }
    const isPB = (p: LandingPoint) => p.distance === pbDistance && isFinite(pbDistance);

    // Draw points
    const allPointSets = overlayPoints
      ? overlayPoints.map((pts, i) => ({ pts, color: overlayColors?.[i] || getColor(i, theme) }))
      : [{ pts: points, color: theme.fg }]; // default landing point = white

    if (colorMode === 'heatmap' && !overlayPoints) {
      drawHeatmap(ctx, points, theme);
    } else {
      for (const { pts, color } of allPointSets) {
        for (const point of pts) {
          const pb = isPB(point);
          ctx.beginPath();
          ctx.arc(point.x, point.y, pb ? 6 : 5, 0, 2 * Math.PI);
          ctx.fillStyle = pb ? theme.lime : color;
          ctx.fill();
          ctx.strokeStyle = pb ? theme.bg : theme.surface;
          ctx.lineWidth = pb ? 1.5 : 1;
          ctx.stroke();
        }
      }
    }
  }, [points, depth, metersPerPixel, colorMode, overlayPoints, overlayColors, distanceUnit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawSector(ctx);

    // Redraw when the dark/paper register flips (theme cache is keyed on it),
    // since drawSector reads CSS tokens at draw time but has no register dep.
    if (typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      const c = canvasRef.current?.getContext('2d');
      if (c) drawSector(c);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, [drawSector]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !onAddPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Calculate distance from throwing circle center
    const dx = x - CIRCLE_X;
    const dy = CIRCLE_Y - y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    const distance = Math.round(pixelDistance * metersPerPixel * 100) / 100;

    // Check if within sector
    const angle = Math.atan2(Math.abs(dx), dy) * (180 / Math.PI);
    if (angle > SECTOR_ANGLE / 2 || y > CIRCLE_Y) return;

    onAddPoint({ x, y, distance });
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly || !onAddPoint) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const dx = x - CIRCLE_X;
    const dy = CIRCLE_Y - y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    const distance = Math.round(pixelDistance * metersPerPixel * 100) / 100;

    const angle = Math.atan2(Math.abs(dx), dy) * (180 / Math.PI);
    if (angle > SECTOR_ANGLE / 2 || y > CIRCLE_Y) return;

    onAddPoint({ x, y, distance });
  };

  return (
    <div className="sector-map">
      {!readOnly && (
        <div className="sector-controls">
          <label className="label">Sector Depth (m)</label>
          <input
            type="number"
            className="input-small"
            value={depth}
            onChange={(e) => setDepth(Math.max(5, parseInt(e.target.value) || 20))}
            min="5"
            max="100"
            style={{ width: 80 }}
          />
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        onTouchStart={handleTouch}
        className="sector-canvas"
        role="img"
        aria-label={ariaSummary}
        style={{ cursor: readOnly ? 'default' : 'crosshair' }}
      />
      {points.length > 0 && !readOnly && !hideList && (
        <div className="landing-points-list">
          {points.map((p, i) => (
            <div key={i} className="landing-point-item">
              <span>{formatDistance(p.distance, distanceUnit)}</span>
              {onRemovePoint && (
                <button className="remove-point-btn" onClick={() => onRemovePoint(i)}>
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function drawHeatmap(ctx: CanvasRenderingContext2D, points: LandingPoint[], theme: ChartTheme) {
  // Lime (cold edge) -> ember (hot center) ramp instead of the old red->orange.
  for (const point of points) {
    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 20);
    gradient.addColorStop(0, heatStop(theme, 0, 0.6));    // hot center = ember
    gradient.addColorStop(0.5, heatStop(theme, 0.5, 0.3)); // mid
    gradient.addColorStop(1, heatStop(theme, 1, 0));       // cold edge = lime, fading out
    ctx.fillStyle = gradient;
    ctx.fillRect(point.x - 20, point.y - 20, 40, 40);
  }
  // Draw dots on top
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = theme.fg;
    ctx.fill();
  }
}

function getColor(index: number, theme: ChartTheme): string {
  const colors = [
    theme.event['discus'],
    theme.event['shot-put'],
    theme.event['hammer'],
    theme.event['weight-throw'],
    theme.event['javelin'],
  ];
  return colors[index % colors.length];
}
