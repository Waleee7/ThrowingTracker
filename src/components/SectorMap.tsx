'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { LandingPoint } from '@/lib/types';

interface SectorMapProps {
  sectorDepth: number; // meters
  points: LandingPoint[];
  onAddPoint?: (point: LandingPoint) => void;
  onRemovePoint?: (index: number) => void;
  readOnly?: boolean;
  colorMode?: 'default' | 'heatmap';
  overlayPoints?: LandingPoint[][];
  overlayColors?: string[];
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
  onAddPoint,
  onRemovePoint,
  readOnly = false,
  colorMode = 'default',
  overlayPoints,
  overlayColors,
}: SectorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(sectorDepth);

  const metersPerPixel = depth / (CIRCLE_Y - 30);

  const drawSector = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sector lines
    const halfAngle = (SECTOR_ANGLE / 2) * (Math.PI / 180);
    const sectorLength = CIRCLE_Y - 20;

    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
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

    // Distance rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let d = 5; d <= depth; d += 5) {
      const r = d / metersPerPixel;
      ctx.beginPath();
      ctx.arc(CIRCLE_X, CIRCLE_Y, r, Math.PI + halfAngle, 2 * Math.PI - halfAngle);
      ctx.stroke();

      // Label
      if (d % 10 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${d}m`, CIRCLE_X + 3, CIRCLE_Y - r + 12);
      }
    }

    // Throwing circle
    ctx.beginPath();
    ctx.arc(CIRCLE_X, CIRCLE_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    const allPointSets = overlayPoints
      ? overlayPoints.map((pts, i) => ({ pts, color: overlayColors?.[i] || getColor(i) }))
      : [{ pts: points, color: '#43e97b' }];

    if (colorMode === 'heatmap' && !overlayPoints) {
      drawHeatmap(ctx, points);
    } else {
      for (const { pts, color } of allPointSets) {
        for (const point of pts) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }, [points, depth, metersPerPixel, colorMode, overlayPoints, overlayColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawSector(ctx);
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
        style={{ cursor: readOnly ? 'default' : 'crosshair' }}
      />
      {points.length > 0 && !readOnly && (
        <div className="landing-points-list">
          {points.map((p, i) => (
            <div key={i} className="landing-point-item">
              <span>{p.distance}m</span>
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

function drawHeatmap(ctx: CanvasRenderingContext2D, points: LandingPoint[]) {
  for (const point of points) {
    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 20);
    gradient.addColorStop(0, 'rgba(255, 65, 54, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(point.x - 20, point.y - 20, 40, 40);
  }
  // Draw dots on top
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

function getColor(index: number): string {
  const colors = ['#43e97b', '#667eea', '#f093fb', '#4facfe', '#ff6b6b', '#ffd93d'];
  return colors[index % colors.length];
}
