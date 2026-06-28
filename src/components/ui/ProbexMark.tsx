/**
 * ProbexMark
 * ──────────
 * Option 2 brand mark — folded-ribbon "P" in the blue→purple gradient on a
 * dark rounded square. Inline SVG for sidebar, topnav, footer, and brand
 * contexts. Geometry mirrors public/probex-icon.svg (the favicon source),
 * scaled to a 100×100 box.
 *
 * Gradient: #3B82F6 blue → #6D5EF7 purple
 * Background: #0B1220 deep navy
 */

interface ProbexMarkProps {
  size?: number
  className?: string
}

export function ProbexMark({ size = 24, className }: ProbexMarkProps) {
  const s  = size
  const id = `pm-${size}`

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Probex"
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0.85" y1="0.05" x2="0.15" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#3B82F6"/>
          <stop offset="48%"  stopColor="#4F6EF5"/>
          <stop offset="100%" stopColor="#6D5EF7"/>
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0.85" y1="0.05" x2="0.15" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#4F46E5"/>
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="100" height="100" rx="21"/>
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="100" height="100" rx="21" fill="#0B1220"/>

      <g clipPath={`url(#${id}-clip)`}>
        {/* Soft brand glow */}
        <ellipse cx="58.6" cy="37.1" rx="33.2" ry="27.3" fill="#4F6EF5" fillOpacity="0.10"/>

        {/* Stem — bold vertical ribbon with lower-left tail */}
        <polygon points="29.3,18.75 46.1,18.75 46.1,70.3 38.3,84 29.3,84" fill={`url(#${id}-g)`}/>

        {/* Bowl — folded ribbon loop */}
        <path
          d="M 46.1 18.75 L 62.1 18.75 A 29.3 29.3 0 0 1 62.1 72.7 L 46.1 72.7 L 46.1 58.6 L 58.6 58.6 A 15.2 15.2 0 0 0 58.6 32.8 L 46.1 32.8 Z"
          fill={`url(#${id}-g)`}
        />

        {/* Fold creases — origami depth (hidden at very small sizes) */}
        {size >= 16 && (
          <>
            <polygon points="46.1,18.75 46.1,32.8 58.6,32.8" fill={`url(#${id}-fold)`} fillOpacity="0.55"/>
            <polygon points="46.1,58.6 58.6,58.6 46.1,72.7" fill={`url(#${id}-fold)`} fillOpacity="0.55"/>
          </>
        )}
      </g>
    </svg>
  )
}
