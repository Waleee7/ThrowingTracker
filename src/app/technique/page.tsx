'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TechniqueLibrary from '@/components/TechniqueLibrary';

function TechniqueInner() {
  const params = useSearchParams();
  return <TechniqueLibrary initialEvent={params.get('event')} />;
}

export default function TechniquePage() {
  return (
    <Suspense fallback={<div className="tab-content" />}>
      <TechniqueInner />
    </Suspense>
  );
}
