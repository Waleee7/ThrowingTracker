'use client';

import { DiscIcon } from '@/components/Icons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** Shared welcoming empty state with optional primary/secondary CTAs. */
export default function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  const hasActions = (actionLabel && onAction) || (secondaryLabel && onSecondary);
  return (
    <div className="empty-state">
      <div className="empty-mark" aria-hidden="true"><DiscIcon size={34} /></div>
      <p className="empty-title">{title}</p>
      {text && <p className="empty-text">{text}</p>}
      {hasActions && (
        <div className="empty-actions">
          {actionLabel && onAction && (
            <button className="primary-button" onClick={onAction}>{actionLabel}</button>
          )}
          {secondaryLabel && onSecondary && (
            <button className="secondary-button" onClick={onSecondary}>{secondaryLabel}</button>
          )}
        </div>
      )}
    </div>
  );
}
