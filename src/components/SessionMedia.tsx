'use client';

import { useEffect, useState } from 'react';
import { MediaAttachment } from '@/lib/types';
import { getMedia } from '@/lib/media-storage';

/**
 * Renders a session's media attachments. Small images carry inline base64
 * (dataUrl); videos and large images live in IndexedDB and are resolved to
 * object URLs on mount (and revoked on unmount to avoid leaks).
 */
export default function SessionMedia({ media }: { media: MediaAttachment[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    (async () => {
      const next: Record<string, string> = {};
      for (const m of media) {
        if (!m.indexedDbKey) continue;
        const blob = await getMedia(m.indexedDbKey).catch(() => null);
        if (!active) return;
        if (blob) {
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          next[m.id] = url;
        }
      }
      if (active) setUrls(next);
    })();

    return () => {
      active = false;
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [media]);

  if (!media || media.length === 0) return null;

  return (
    <div className="media-grid">
      {media.map((m) => {
        const src = m.dataUrl ?? urls[m.id];
        const isImage = m.type.startsWith('image/');
        return (
          <div key={m.id} className="media-item">
            {src && isImage ? (
              <img src={src} alt={m.name} className="media-thumbnail" />
            ) : src && !isImage ? (
              <video src={src} className="media-thumbnail" controls preload="metadata" />
            ) : (
              <div className="video-placeholder">
                <span className="video-icon">{isImage ? '\u{1F5BC}\u{FE0F}' : '\u{1F3AC}'}</span>
                <span className="video-name">{m.name}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
