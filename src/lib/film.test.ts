import { describe, expect, it } from 'vitest';
import { videoPosAt, type FilmEvent } from './film';

const ev = (at: number, videoT: number, rate: number, playing: boolean): FilmEvent => ({
  at, videoT, rate, playing,
});

describe('videoPosAt (film-session replay sync)', () => {
  it('returns rest state with no events', () => {
    expect(videoPosAt([], 5000)).toEqual({ videoT: 0, rate: 1, playing: false });
  });

  it('advances the video while playing at 1x', () => {
    const events = [ev(0, 0, 1, true)];
    expect(videoPosAt(events, 1000).videoT).toBeCloseTo(1);
    expect(videoPosAt(events, 2500).videoT).toBeCloseTo(2.5);
  });

  it('respects slow-motion rate', () => {
    const events = [ev(0, 0, 1, true), ev(2000, 2, 0.5, true)];
    expect(videoPosAt(events, 3000).videoT).toBeCloseTo(2.5); // 1s at 0.5x past the rate change
    expect(videoPosAt(events, 3000).rate).toBe(0.5);
  });

  it('holds position while paused', () => {
    const events = [ev(0, 0, 1, true), ev(4000, 3, 0.5, false)];
    const at6s = videoPosAt(events, 6000);
    expect(at6s.videoT).toBe(3);
    expect(at6s.playing).toBe(false);
  });

  it('jumps on seeks', () => {
    const events = [ev(0, 0, 1, true), ev(1000, 10, 1, true)]; // seek to 10s
    expect(videoPosAt(events, 1500).videoT).toBeCloseTo(10.5);
  });

  it('uses the first snapshot before any later events', () => {
    const events = [ev(0, 5, 1, false), ev(3000, 5, 1, true)];
    expect(videoPosAt(events, 1000).videoT).toBe(5);
    expect(videoPosAt(events, 1000).playing).toBe(false);
  });
});
