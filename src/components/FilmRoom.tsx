'use client';

// Film Room — upload your own film, scrub it frame-by-frame, draw on it, and
// record a voice-over while you drive the tape (a real film session). Replay
// syncs the video to your narration. Local-first: blobs in IndexedDB, records
// in localStorage. Nothing here is throws-specific — any athlete, any sport.

import { useCallback, useEffect, useRef, useState } from 'react';
import { storage } from '@/lib/storage';
import { storeMedia, getMedia, deleteMedia } from '@/lib/media-storage';
import {
  type FilmSessionRecord,
  type FilmEvent,
  videoPosAt,
  newFilmId,
  filmVideoKey,
  filmAudioKey,
  pickAudioMime,
} from '@/lib/film';
import { toLocalDateKey } from '@/lib/dates';
import { vibrate } from '@/lib/haptics';

const SPEEDS = [0.25, 0.5, 1];
const FPS = 30;
const COLORS = ['#FF5A1F', '#C8FF00', '#FFFFFF'];

type Tool = 'free' | 'line' | 'angle';
type Mode = 'free' | 'recording' | 'replaying';

interface Stroke {
  tool: Tool;
  color: string;
  points: { x: number; y: number }[];
  label?: { text: string; x: number; y: number };
}

export default function FilmRoom() {
  const [records, setRecords] = useState<FilmSessionRecord[]>([]);
  const [active, setActive] = useState<FilmSessionRecord | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecords(storage.getFilmSessions()); }, []);
  // Revoke object URLs when they change / on unmount.
  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const persist = useCallback((next: FilmSessionRecord[]) => {
    setRecords(next);
    storage.setFilmSessions(next);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    const id = newFilmId();
    try {
      await storeMedia(filmVideoKey(id), file);
    } catch {
      setError('Could not store that video — device storage may be full.');
      return;
    }
    const record: FilmSessionRecord = {
      id,
      name: `Film session · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      createdAt: toLocalDateKey(),
      videoKey: filmVideoKey(id),
      videoType: file.type || 'video/mp4',
    };
    persist([record, ...records]);
    setActive(record);
    setVideoUrl(URL.createObjectURL(file));
    setAudioUrl('');
  };

  const openRecord = async (r: FilmSessionRecord) => {
    setError('');
    const blob = await getMedia(r.videoKey);
    if (!blob) { setError('Video data is missing for that session.'); return; }
    setVideoUrl(URL.createObjectURL(blob));
    if (r.audioKey) {
      const audio = await getMedia(r.audioKey);
      setAudioUrl(audio ? URL.createObjectURL(audio) : '');
    } else {
      setAudioUrl('');
    }
    setActive(r);
  };

  const deleteRecord = async (r: FilmSessionRecord) => {
    if (!window.confirm(`Delete "${r.name}"? The video and voice-over are removed from this device.`)) return;
    try { await deleteMedia(r.videoKey); } catch { /* best-effort */ }
    if (r.audioKey) { try { await deleteMedia(r.audioKey); } catch { /* best-effort */ } }
    persist(records.filter((x) => x.id !== r.id));
    if (active?.id === r.id) setActive(null);
  };

  const updateRecord = (updated: FilmSessionRecord) => {
    persist(records.map((r) => (r.id === updated.id ? updated : r)));
    setActive(updated);
  };

  if (!active) {
    return (
      <div className="film-picker">
        <p className="film-intro">
          Your film, your session. Load a clip, scrub it frame by frame, draw on it,
          and record a voice-over breakdown — then replay the whole session.
        </p>
        <button className="primary-button film-upload-btn" onClick={() => fileRef.current?.click()}>
          + Load a video
        </button>
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} />
        {error && <p className="film-error">{error}</p>}

        {records.length > 0 && (
          <ul className="film-list">
            {records.map((r) => (
              <li key={r.id} className="film-row">
                <button className="film-row-open" onClick={() => openRecord(r)}>
                  <span className="film-row-name">{r.name}</span>
                  <span className="film-row-meta t-meta">
                    {r.createdAt}
                    {r.audioKey && <span className="film-vo-badge">VOICE-OVER</span>}
                  </span>
                </button>
                <button className="meet-remove" aria-label={`Delete ${r.name}`} onClick={() => deleteRecord(r)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <FilmStudio
      key={active.id}
      record={active}
      videoUrl={videoUrl}
      audioUrl={audioUrl}
      onBack={() => setActive(null)}
      onUpdate={updateRecord}
      onAudioSaved={(url) => setAudioUrl(url)}
    />
  );
}

/* ============================== THE STUDIO ============================== */

function FilmStudio({
  record,
  videoUrl,
  audioUrl,
  onBack,
  onUpdate,
  onAudioSaved,
}: {
  record: FilmSessionRecord;
  videoUrl: string;
  audioUrl: string;
  onBack: () => void;
  onUpdate: (r: FilmSessionRecord) => void;
  onAudioSaved: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [mode, setMode] = useState<Mode>('free');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [name, setName] = useState(record.name);
  const [recSecs, setRecSecs] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const [tool, setTool] = useState<Tool>('free');
  const [color, setColor] = useState(COLORS[0]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const draftRef = useRef<{ x: number; y: number }[]>([]);
  const drawingRef = useRef(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recStreamRef = useRef<MediaStream | null>(null);
  const recStartRef = useRef(0);
  const eventsRef = useRef<FilmEvent[]>([]);
  const rafRef = useRef(0);

  const video = () => videoRef.current;

  /* ---------- transport (every action logs a snapshot while recording) ---------- */
  const logEvent = (over: Partial<FilmEvent> = {}) => {
    if (mode !== 'recording') return;
    const v = video();
    if (!v) return;
    eventsRef.current.push({
      at: Math.round(performance.now() - recStartRef.current),
      videoT: v.currentTime,
      rate: v.playbackRate,
      playing: !v.paused,
      ...over,
    });
  };

  const togglePlay = () => {
    const v = video();
    if (!v || mode === 'replaying') return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
      logEvent({ playing: true });
    } else {
      v.pause();
      setPlaying(false);
      logEvent({ playing: false });
    }
  };

  const stepFrame = (dir: 1 | -1) => {
    const v = video();
    if (!v || mode === 'replaying') return;
    v.pause();
    setPlaying(false);
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + dir / FPS));
    logEvent({ playing: false, videoT: v.currentTime });
  };

  const changeSpeed = (s: number) => {
    const v = video();
    if (!v || mode === 'replaying') return;
    v.playbackRate = s;
    setSpeed(s);
    logEvent({ rate: s });
  };

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = video();
    if (!v || mode === 'replaying') return;
    const t = parseFloat(e.target.value);
    v.currentTime = t;
    setTime(t);
    logEvent({ videoT: t });
  };

  /* ---------- telestration (pointer events → mouse + touch) ---------- */
  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'replaying') return;
    const v = video();
    if (v && !v.paused) { v.pause(); setPlaying(false); logEvent({ playing: false }); }
    drawingRef.current = true;
    draftRef.current = [canvasPoint(e)];
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    draftRef.current.push(canvasPoint(e));
    redraw();
    e.preventDefault();
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const pts = draftRef.current;
    draftRef.current = [];
    if (pts.length < 2) { redraw(); return; }

    const stroke: Stroke = { tool, color, points: pts };
    if (tool === 'angle' && pts.length >= 3) {
      const a = pts[0], m = pts[Math.floor(pts.length / 2)], b = pts[pts.length - 1];
      const a1 = Math.atan2(a.y - m.y, a.x - m.x);
      const a2 = Math.atan2(b.y - m.y, b.x - m.x);
      let deg = Math.abs((a2 - a1) * (180 / Math.PI));
      if (deg > 180) deg = 360 - deg;
      stroke.label = { text: `${deg.toFixed(1)}°`, x: m.x + 12, y: m.y - 12 };
    }
    setStrokes((prev) => [...prev, stroke]);
  };

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const lineW = Math.max(3, c.width / 280);
    const all: Stroke[] = drawingRef.current && draftRef.current.length > 1
      ? [...strokes, { tool, color, points: draftRef.current }]
      : strokes;
    for (const s of all) drawStroke(ctx, s, lineW, c.width / 30);
  }, [strokes, tool, color]);

  useEffect(() => { redraw(); }, [redraw]);

  /* ---------- voice-over: record ---------- */
  const startRecording = async () => {
    const v = video();
    if (!v) return;
    setStatusMsg('');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatusMsg('Mic permission needed for a voice-over.');
      return;
    }
    const mime = pickAudioMime();
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const type = rec.mimeType || mime || 'audio/webm';
      const blob = new Blob(chunks, { type });
      try {
        await storeMedia(filmAudioKey(record.id), blob);
        const updated: FilmSessionRecord = {
          ...record,
          name,
          audioKey: filmAudioKey(record.id),
          audioType: type,
          events: eventsRef.current,
        };
        onUpdate(updated);
        onAudioSaved(URL.createObjectURL(blob));
        setStatusMsg('Voice-over saved — hit Replay to watch your film session.');
      } catch {
        setStatusMsg('Could not save the voice-over (storage full?).');
      }
    };

    v.muted = true; // avoid speaker bleed into the mic
    recorderRef.current = rec;
    recStreamRef.current = stream;
    recStartRef.current = performance.now();
    eventsRef.current = [{ at: 0, videoT: v.currentTime, rate: v.playbackRate, playing: !v.paused }];
    setRecSecs(0);
    setMode('recording');
    vibrate(20);
    rec.start();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    const v = video();
    if (v) v.muted = false;
    setMode('free');
    vibrate([20, 30, 20]);
  };

  useEffect(() => {
    if (mode !== 'recording') return;
    const id = setInterval(() => setRecSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [mode]);

  /* ---------- voice-over: synced replay ---------- */
  const startReplay = () => {
    const v = video();
    const a = audioRef.current;
    const events = record.events;
    if (!v || !a || !events?.length) return;
    setMode('replaying');
    v.muted = true;
    a.currentTime = 0;
    a.play().catch(() => {});
    const tick = () => {
      if (!videoRef.current || !audioRef.current) return;
      const t = audioRef.current.currentTime * 1000;
      const want = videoPosAt(events, t);
      const vv = videoRef.current;
      if (vv.playbackRate !== want.rate) vv.playbackRate = want.rate;
      if (want.playing && vv.paused) vv.play().catch(() => {});
      if (!want.playing && !vv.paused) vv.pause();
      if (Math.abs(vv.currentTime - want.videoT) > 0.35) vv.currentTime = want.videoT;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopReplay = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const a = audioRef.current;
    if (a) a.pause();
    const v = video();
    if (v) { v.pause(); v.muted = false; }
    setPlaying(false);
    setMode('free');
  }, []);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); recStreamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  /* ---------- annotated frame export ---------- */
  const saveFrame = async () => {
    const v = video();
    const overlay = canvasRef.current;
    if (!v || !overlay || !v.videoWidth) return;
    const out = document.createElement('canvas');
    out.width = v.videoWidth;
    out.height = v.videoHeight;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    ctx.drawImage(overlay, 0, 0);
    const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/png'));
    if (!blob) return;
    vibrate(20);
    const file = new File([blob], 'film-frame.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], title: 'Film frame' }); return; } catch { /* fall through */ }
    }
    const url = URL.createObjectURL(blob);
    const aEl = document.createElement('a');
    aEl.href = url;
    aEl.download = 'film-frame.png';
    aEl.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const cs = Math.floor((t % 1) * 100);
    return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  return (
    <div className="film-studio">
      <div className="film-head">
        <button className="secondary-button film-back" onClick={() => { stopReplay(); onBack(); }}>← Film</button>
        <input
          className="film-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => { if (name.trim() && name !== record.name) onUpdate({ ...record, name: name.trim() }); }}
          aria-label="Film session name"
        />
      </div>

      <div className="film-stage">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            setDuration(v.duration || 0);
            const c = canvasRef.current;
            if (c) { c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720; redraw(); }
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
        />
        <canvas
          ref={canvasRef}
          className="film-overlay"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        {mode === 'recording' && <div className="film-rec-pill">● REC {fmt(recSecs)}</div>}
        {mode === 'replaying' && <div className="film-rec-pill replay">▶ FILM SESSION</div>}
      </div>

      {/* transport */}
      <div className="film-transport">
        <input
          type="range"
          className="scrub-bar"
          min={0}
          max={duration || 0}
          step={1 / FPS}
          value={time}
          onChange={scrub}
          disabled={mode === 'replaying'}
          aria-label="Scrub"
        />
        <div className="film-transport-row">
          <span className="film-time tnum">{fmt(time)} / {fmt(duration)}</span>
          <div className="film-buttons">
            <button className="film-btn" onClick={() => stepFrame(-1)} disabled={mode === 'replaying'} aria-label="Back one frame">⏮</button>
            <button className="film-btn film-play" onClick={togglePlay} disabled={mode === 'replaying'} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '⏸' : '▶'}</button>
            <button className="film-btn" onClick={() => stepFrame(1)} disabled={mode === 'replaying'} aria-label="Forward one frame">⏭</button>
          </div>
          <div className="film-speeds">
            {SPEEDS.map((s) => (
              <button key={s} className={`prtl-chip${speed === s ? ' active' : ''}`} onClick={() => changeSpeed(s)} disabled={mode === 'replaying'}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* markup tools */}
      <div className="film-tools">
        <div className="film-tool-group">
          {(['free', 'line', 'angle'] as const).map((t) => (
            <button key={t} className={`prtl-chip${tool === t ? ' active' : ''}`} onClick={() => setTool(t)}>
              {t === 'free' ? 'Draw' : t === 'line' ? 'Line' : 'Angle'}
            </button>
          ))}
        </div>
        <div className="film-tool-group">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`film-color${color === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
          <button className="prtl-chip" onClick={() => setStrokes((p) => p.slice(0, -1))} disabled={!strokes.length}>Undo</button>
          <button className="prtl-chip" onClick={() => setStrokes([])} disabled={!strokes.length}>Clear</button>
          <button className="prtl-chip" onClick={saveFrame}>Save frame</button>
        </div>
      </div>

      {/* voice-over */}
      <div className="film-vo">
        {mode === 'recording' ? (
          <button className="primary-button film-vo-stop" onClick={stopRecording}>■ Stop &amp; save voice-over</button>
        ) : mode === 'replaying' ? (
          <button className="primary-button" onClick={stopReplay}>■ Stop film session</button>
        ) : (
          <div className="film-vo-row">
            <button className="secondary-button" onClick={startRecording}>● Record voice-over</button>
            {record.audioKey && audioUrl && (
              <button className="primary-button" onClick={startReplay}>▶ Replay film session</button>
            )}
          </div>
        )}
        {statusMsg && <p className="field-hint">{statusMsg}</p>}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={stopReplay} preload="metadata" />}
      </div>
    </div>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, lineW: number, fontPx: number) {
  if (s.points.length < 2) return;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (s.tool === 'line') {
    ctx.moveTo(s.points[0].x, s.points[0].y);
    ctx.lineTo(s.points[s.points.length - 1].x, s.points[s.points.length - 1].y);
  } else if (s.tool === 'angle') {
    const a = s.points[0], m = s.points[Math.floor(s.points.length / 2)], b = s.points[s.points.length - 1];
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(m.x, m.y);
    ctx.lineTo(b.x, b.y);
  } else {
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
  }
  ctx.stroke();
  if (s.label) {
    ctx.font = `700 ${Math.max(16, fontPx)}px sans-serif`;
    ctx.fillStyle = s.color;
    ctx.fillText(s.label.text, s.label.x, s.label.y);
  }
}
