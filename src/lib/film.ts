// Film Room — athlete film sessions. An athlete loads their own video, scrubs
// it frame-by-frame, draws on it, and records a voice-over while driving the
// tape (play/pause/slow-mo/seek). We persist the video + narration audio as
// IndexedDB blobs and a timeline of transport snapshots, then replay by
// driving the video off the audio clock. Sport-agnostic by design — it's just
// film + tools.

export interface FilmEvent {
  /** ms on the narration (audio) clock when this snapshot was taken */
  at: number;
  /** video position (seconds) right after the action */
  videoT: number;
  /** playback rate in effect */
  rate: number;
  /** whether the video is playing after the action */
  playing: boolean;
}

export interface FilmSessionRecord {
  id: string;
  name: string;
  createdAt: string;          // local date key
  videoKey: string;           // IndexedDB blob key
  videoType: string;          // mime, for the <video> source
  audioKey?: string;          // IndexedDB blob key (voice-over), when recorded
  audioType?: string;
  events?: FilmEvent[];       // transport timeline for synced replay
}

/**
 * Where the video should be at audio-clock time `tMs`, given the recorded
 * timeline. Pure — drives replay and is unit-tested.
 */
export function videoPosAt(events: FilmEvent[], tMs: number): { videoT: number; rate: number; playing: boolean } {
  if (!events.length) return { videoT: 0, rate: 1, playing: false };

  let snap = events[0];
  for (const ev of events) {
    if (ev.at <= tMs) snap = ev;
    else break;
  }
  const elapsed = Math.max(0, tMs - snap.at) / 1000;
  return {
    videoT: snap.videoT + (snap.playing ? elapsed * snap.rate : 0),
    rate: snap.rate,
    playing: snap.playing,
  };
}

export function newFilmId(): string {
  return `film-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Blob keys for a film session's media. */
export const filmVideoKey = (id: string) => `${id}-video`;
export const filmAudioKey = (id: string) => `${id}-audio`;

/** Preferred MediaRecorder audio mime for this browser (Safari needs mp4). */
export function pickAudioMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}
