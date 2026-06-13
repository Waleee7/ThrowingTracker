'use client';

import { useEffect, useState } from 'react';
import { STORAGE_ERROR_EVENT } from '@/lib/storage';

/**
 * Listens for failed localStorage writes (quota exceeded / private browsing)
 * and shows a persistent warning so the athlete knows their last change did
 * NOT save. Without this, a dropped write looks saved until the next reload.
 */
export default function StorageAlert() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onError = () => setVisible(true);
    window.addEventListener(STORAGE_ERROR_EVENT, onError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, onError);
  }, []);

  if (!visible) return null;

  return (
    <div className="storage-alert" role="alert">
      <span className="storage-alert-text">
        <strong>Couldn&apos;t save your last change</strong> — device storage is full.
        Export a backup in Profile, then clear old data.
      </span>
      <button
        type="button"
        className="storage-alert-dismiss"
        onClick={() => setVisible(false)}
        aria-label="Dismiss storage warning"
      >
        &times;
      </button>
    </div>
  );
}
