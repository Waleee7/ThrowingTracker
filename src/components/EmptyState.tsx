'use client';

import Image from 'next/image';
import emptyField from '@/assets/media/empty-field.webp';

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
      <Image
        src={emptyField}
        alt=""
        width={300}
        height={150}
        placeholder="blur"
        sizes="(max-width: 480px) 80vw, 300px"
        style={{
          width: '100%',
          maxWidth: 170,
          height: 'auto',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-ink-700)',
          marginBottom: 12,
          objectFit: 'cover',
        }}
      />
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
