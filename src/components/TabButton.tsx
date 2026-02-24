'use client';

import { ReactNode } from 'react';
import { TabId } from '@/lib/types';

interface TabButtonProps {
  id: TabId;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: (id: TabId) => void;
}

export default function TabButton({ id, icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className={`tab-button${isActive ? ' active' : ''}`}
      onClick={() => onClick(id)}
    >
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  );
}
