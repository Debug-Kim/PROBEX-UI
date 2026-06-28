import Link from 'next/link'
import { ROUTES } from '@/config/constants'

/**
 * Market Not Found
 * ─────────────────
 * Rendered when `notFound()` is called in page.tsx for unknown market IDs.
 * Provides a clear recovery path back to market discovery.
 */
export default function MarketNotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: 'var(--probex-surface)',
          border:     '1px solid var(--probex-border)',
        }}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: 'var(--probex-text-muted)' }}
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <line x1="11" y1="8" x2="11" y2="11"/>
          <line x1="11" y1="14" x2="11.01" y2="14"/>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--probex-text-primary)' }}
        >
          Market Not Found
        </h1>
        <p
          className="text-sm max-w-sm"
          style={{ color: 'var(--probex-text-muted)' }}
        >
          This market doesn&apos;t exist or may have been removed.
          Browse active Bitcoin prediction markets below.
        </p>
      </div>

      {/* Action */}
      <Link
        href={ROUTES.MARKETS}
        className="btn-primary px-6 py-2.5 text-sm"
      >
        Browse Markets
      </Link>

    </div>
  )
}
