'use client';

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
  icon = '\u{1F94F}',
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
      <span className="empty-icon">{icon}</span>
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
