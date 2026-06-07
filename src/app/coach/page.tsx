'use client';

import Link from 'next/link';
import CoachChat from '@/components/CoachChat';

export default function CoachPage() {
  return (
    <div className="tab-content coach-page">
      <CoachChat />
      <Link href="/technique" className="coach-technique-link">&#9670; Browse the Technique Library</Link>
    </div>
  );
}
