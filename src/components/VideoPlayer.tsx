'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  title?: string;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1];
const FPS = 30;

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [drawTool, setDrawTool] = useState<'free' | 'line' | 'angle'>('free');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [annotations, setAnnotations] = useState<Array<Array<{ x: number; y: number; color: string; tool: string }>>>([]);

  const video = videoRef.current;

  const togglePlay = () => {
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const stepFrame = (direction: 1 | -1) => {
    if (!video) return;
    video.pause();
    setPlaying(false);
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + (direction / FPS)));
  };

  const changeSpeed = (newSpeed: number) => {
    if (!video) return;
    video.playbackRate = newSpeed;
    setSpeed(newSpeed);
  };

  const handleTimeUpdate = () => {
    if (video) setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (video) setDuration(video.duration);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const captureAnnotation = () => {
    if (!video || !canvasRef.current) return;
    video.pause();
    setPlaying(false);
    setShowAnnotation(true);

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      // Re-draw existing annotations
      for (const stroke of annotations) {
        drawStroke(ctx, stroke);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showAnnotation) return;
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setDrawPoints([point]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !showAnnotation) return;
    const point = getCanvasPoint(e);
    setDrawPoints((prev) => [...prev, point]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    if (drawTool === 'free') {
      const prev = drawPoints[drawPoints.length - 1];
      if (prev) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !showAnnotation) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    if (drawTool === 'line' && drawPoints.length >= 2) {
      const start = drawPoints[0];
      const end = drawPoints[drawPoints.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (drawTool === 'angle' && drawPoints.length >= 3) {
      const start = drawPoints[0];
      const mid = drawPoints[Math.floor(drawPoints.length / 2)];
      const end = drawPoints[drawPoints.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(mid.x, mid.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Calculate and display angle
      const a1 = Math.atan2(start.y - mid.y, start.x - mid.x);
      const a2 = Math.atan2(end.y - mid.y, end.x - mid.x);
      let angleDeg = Math.abs((a2 - a1) * (180 / Math.PI));
      if (angleDeg > 180) angleDeg = 360 - angleDeg;
      ctx.font = '16px sans-serif';
      ctx.fillStyle = drawColor;
      ctx.fillText(`${angleDeg.toFixed(1)}°`, mid.x + 10, mid.y - 10);
    }

    setAnnotations((prev) => [
      ...prev,
      drawPoints.map((p) => ({ ...p, color: drawColor, tool: drawTool })),
    ]);
    setDrawPoints([]);
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const saveAnnotatedFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotated-frame-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return `${min}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player">
      {title && <h4 className="video-title">{title}</h4>}

      <div className="video-container">
        <video
          ref={videoRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
          style={{ display: showAnnotation ? 'none' : 'block' }}
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{ display: showAnnotation ? 'block' : 'none' }}
          className="annotation-canvas"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Controls */}
      <div className="video-controls">
        <div className="video-scrub">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step={1 / FPS}
            value={currentTime}
            onChange={handleScrub}
            className="scrub-bar"
          />
          <span className="video-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="video-buttons">
          <button className="video-btn" onClick={() => stepFrame(-1)} title="Previous frame">
            &#9194;
          </button>
          <button className="video-btn play-btn" onClick={togglePlay}>
            {playing ? '\u23F8' : '\u25B6'}
          </button>
          <button className="video-btn" onClick={() => stepFrame(1)} title="Next frame">
            &#9193;
          </button>

          <div className="speed-controls">
            {PLAYBACK_SPEEDS.map((s) => (
              <button
                key={s}
                className={`speed-btn${speed === s ? ' active' : ''}`}
                onClick={() => changeSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {!showAnnotation ? (
          <button className="secondary-button" onClick={captureAnnotation}>
            &#9997; Annotate Frame
          </button>
        ) : (
          <div className="annotation-tools">
            <div className="tool-row">
              {(['free', 'line', 'angle'] as const).map((tool) => (
                <button
                  key={tool}
                  className={`tool-btn${drawTool === tool ? ' active' : ''}`}
                  onClick={() => setDrawTool(tool)}
                >
                  {tool === 'free' ? 'Draw' : tool === 'line' ? 'Line' : 'Angle'}
                </button>
              ))}
            </div>
            <div className="color-row">
              {['#ff0000', '#ffff00', '#ffffff'].map((color) => (
                <button
                  key={color}
                  className={`color-btn${drawColor === color ? ' active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawColor(color)}
                />
              ))}
            </div>
            <div className="annotation-actions">
              <button className="secondary-button" onClick={saveAnnotatedFrame}>
                Save Frame
              </button>
              <button className="secondary-button" onClick={() => { setShowAnnotation(false); setAnnotations([]); }}>
                Back to Video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Array<{ x: number; y: number; color: string; tool: string }>) {
  if (stroke.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = stroke[0].color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.moveTo(stroke[0].x, stroke[0].y);
  for (let i = 1; i < stroke.length; i++) {
    ctx.lineTo(stroke[i].x, stroke[i].y);
  }
  ctx.stroke();
}
