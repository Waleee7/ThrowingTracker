'use client';

interface IconProps {
  size?: number;
  className?: string;
}

// Dashboard: Throwing ring/sector with a radiating star — represents overview
export function DashboardIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14L6 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14L18 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Profile: Athletic figure in throwing stance
export function ProfileIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 22V14L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 22V14L19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Log: Shot put implement with a plus sign — represents adding a session
export function LogIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10" cy="14" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="14" r="3" fill="currentColor" opacity="0.3" />
      <line x1="18" y1="4" x2="18" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// History: Stopwatch with sector marks — represents past sessions
export function HistoryIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9V13L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 3H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 7.5L19.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Progress: Trajectory arc with distance markers — represents growth
export function ProgressIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 20Q8 4 21 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="21" cy="4" r="2" fill="currentColor" />
      <line x1="3" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="8" y1="18" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="14" y1="18" x2="14" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="20" y1="18" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// App Logo: Throwing circle with sector lines and an implement trajectory
export function AppLogo({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill="url(#logoGrad)" />
      {/* Throwing circle */}
      <circle cx="24" cy="32" r="5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
      {/* Sector lines */}
      <path d="M24 32L16 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M24 32L32 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Trajectory arc */}
      <path d="M24 30Q20 16 28 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Implement (shot put ball) */}
      <circle cx="28" cy="12" r="3.5" fill="white" />
      {/* Speed lines */}
      <line x1="22" y1="28" x2="18" y2="24" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="23" y1="26" x2="20" y2="22" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// Dark mode toggle icons
export function SunIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 8;
        const y1 = 12 + Math.sin(rad) * 8;
        const x2 = 12 + Math.cos(rad) * 10;
        const y2 = 12 + Math.sin(rad) * 10;
        return (
          <line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function MoonIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
