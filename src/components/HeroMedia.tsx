'use client';

// Broadcast hero media layer — still-first, with a video seam.
// Renders an event-specific cinematic still behind a dark scrim with a slow
// ken-burns pan. If a looping hero video is later dropped at
// /public/media/hero.mp4 (+ poster), pass `video` to promote it — no other
// code changes needed. Imagery is baked (src/assets/media), zero runtime cost.

import Image, { type StaticImageData } from 'next/image';

import heroDashboard from '@/assets/media/hero-dashboard.webp';
import shotPut from '@/assets/media/event-shot-put.webp';
import discus from '@/assets/media/event-discus.webp';
import hammer from '@/assets/media/event-hammer.webp';
import weightThrow from '@/assets/media/event-weight-throw.webp';
import javelin from '@/assets/media/event-javelin.webp';

const EVENT_IMAGE: Record<string, StaticImageData> = {
  'shot-put': shotPut,
  discus,
  hammer,
  'weight-throw': weightThrow,
  javelin,
};

export function eventHero(event?: string | null): StaticImageData {
  return (event && EVENT_IMAGE[event]) || heroDashboard;
}

interface HeroMediaProps {
  /** Pick an event-specific still; falls back to the default stadium hero. */
  event?: string | null;
  /** Override the image entirely. */
  image?: StaticImageData;
  /** Optional looping video (e.g. '/media/hero.mp4'); poster = the still. */
  video?: string;
  /** Above-the-fold heroes should set priority for LCP. */
  priority?: boolean;
  /** Disable the ken-burns pan (e.g. for small cards). */
  still?: boolean;
  className?: string;
  /** rounded corners token; defaults to lg */
  radius?: 'md' | 'lg' | 'xl' | 'none';
  children?: React.ReactNode;
}

export default function HeroMedia({
  event,
  image,
  video,
  priority = false,
  still = false,
  className = '',
  radius = 'lg',
  children,
}: HeroMediaProps) {
  const img = image ?? eventHero(event);
  const radiusVar =
    radius === 'none' ? '0' : `var(--radius-${radius})`;

  return (
    <div className={`hero-media ${className}`} style={{ borderRadius: radiusVar }}>
      <div className="hero-media-bg" aria-hidden="true">
        {video ? (
          <video
            className="hero-media-video"
            autoPlay
            muted
            loop
            playsInline
            poster={img.src}
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={img}
            alt=""
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            placeholder="blur"
            priority={priority}
            className={still ? 'hero-media-img' : 'hero-media-img kb-pan'}
            style={{ objectFit: 'cover' }}
          />
        )}
        <div className="hero-media-scrim" />
      </div>
      <div className="hero-media-content">{children}</div>
    </div>
  );
}
