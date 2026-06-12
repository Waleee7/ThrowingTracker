'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TechniqueLibrary from '@/components/TechniqueLibrary';
import FilmRoom from '@/components/FilmRoom';

// Technique hub: the form Library (cues + demos) and the Film Room (your own
// video — scrub, draw, voice-over). Deep links: /technique?event=discus and
// /technique?mode=film.
function TechniqueInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<'library' | 'film'>(
    params.get('mode') === 'film' ? 'film' : 'library',
  );

  return (
    <div className="tab-content" id="tab-technique-hub">
      <div className="dash-segment tech-mode-segment">
        <button className={mode === 'library' ? 'active' : ''} onClick={() => setMode('library')}>
          Library
        </button>
        <button className={mode === 'film' ? 'active' : ''} onClick={() => setMode('film')}>
          Film Room
        </button>
      </div>
      {mode === 'library' ? (
        <TechniqueLibrary initialEvent={params.get('event')} />
      ) : (
        <FilmRoom />
      )}
    </div>
  );
}

export default function TechniquePage() {
  return (
    <Suspense fallback={<div className="tab-content" />}>
      <TechniqueInner />
    </Suspense>
  );
}
