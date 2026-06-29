'use client'

// A single research report rendered as a clickable card. Three variants:
// 'standard' (full card), 'compact' (single-line row), and 'featured' (wide hero).

import { cn, formatRelativeTime } from '@/lib/utils'
import { useResearchStore }       from '@/store/researchStore'
import type { ResearchReport, ResearchSentiment } from '@/types/research'
import type { ReportId }          from '@/types/branded'
import type { MouseEvent } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────

type CardVariant = 'standard' | 'compact' | 'featured'

interface ResearchReportCardProps {
  report:     ResearchReport
  variant?:   CardVariant
  onClick?:   (id: ReportId) => void
  className?: string
}

// ─── Sentiment colours ────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<ResearchSentiment, { label: string; colorVar: string }> = {
  'strongly-bullish': { label: '⬆⬆ Strongly Bullish', colorVar: 'var(--probex-positive)'  },
  'bullish':          { label: '⬆  Bullish',           colorVar: 'var(--probex-positive)'  },
  'neutral':          { label: '→  Neutral',            colorVar: 'var(--probex-warning)'   },
  'bearish':          { label: '⬇  Bearish',            colorVar: 'var(--probex-negative)'  },
  'strongly-bearish': { label: '⬇⬇ Strongly Bearish',  colorVar: 'var(--probex-negative)'  },
}

const CONFIDENCE_COLORS = {
  high:   'var(--probex-positive)',
  medium: 'var(--probex-warning)',
  low:    'var(--probex-text-muted)',
}

// ─── Main component ───────────────────────────────────────────────────────

export function ResearchReportCard({
  report,
  variant   = 'standard',
  onClick,
  className,
}: ResearchReportCardProps) {
  const { openReport, toggleSave, savedReportIds, readReportIds } = useResearchStore()

  const isSaved   = savedReportIds.includes(report.id)
  const isRead    = readReportIds.includes(report.id)
  const sentiment = SENTIMENT_CONFIG[report.sentiment]

  const handleClick = () => {
    openReport(report.id)
    onClick?.(report.id)
  }

  const handleSave = (e: MouseEvent) => {
    e.stopPropagation()
    toggleSave(report.id)
  }

  if (variant === 'compact') {
    return (
      <CompactCard
        report={report}
        isSaved={isSaved}
        isRead={isRead}
        sentiment={sentiment}
        onClick={handleClick}
        onSave={handleSave}
        className={className}
      />
    )
  }

  if (variant === 'featured') {
    return (
      <FeaturedCard
        report={report}
        isSaved={isSaved}
        isRead={isRead}
        sentiment={sentiment}
        onClick={handleClick}
        onSave={handleSave}
        className={className}
      />
    )
  }

  return (
    <StandardCard
      report={report}
      isSaved={isSaved}
      isRead={isRead}
      sentiment={sentiment}
      onClick={handleClick}
      onSave={handleSave}
      className={className}
    />
  )
}

// ─── Standard Card ────────────────────────────────────────────────────────

function StandardCard({ report, isSaved, isRead, sentiment, onClick, onSave, className }: CardProps) {
  return (
    <article
      className={cn('flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border)' }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border-active)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--probex-border)' }}
      role="article"
      tabIndex={0}
      aria-label={`Research report: ${report.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      {/* Top row: category + format + unread dot */}
      <div className="flex items-center gap-2">
        <CategoryBadge categoryId={report.categoryId} />
        <FormatBadge format={report.format} />
        {!isRead && <UnreadDot />}
        <div className="ml-auto flex items-center gap-1.5">
          <ReadTimeBadge minutes={report.estimatedReadMinutes} />
        </div>
      </div>

      {/* Sentiment stripe */}
      <div className="flex items-center gap-1.5">
        <div className="h-0.5 w-6 rounded-full flex-shrink-0" style={{ background: sentiment.colorVar }} aria-hidden="true" />
        <span className="text-2xs font-semibold" style={{ color: sentiment.colorVar }}>{sentiment.label}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--probex-text-primary)' }}>
        {report.title}
      </h3>

      {/* Summary excerpt */}
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--probex-text-secondary)' }}>
        {report.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--probex-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: 'var(--probex-text-muted)' }}>{report.author.handle}</span>
          <ConfidenceBadge confidence={report.confidence} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>{formatRelativeTime(report.publishedAt)}</span>
          <SaveButton isSaved={isSaved} onClick={onSave} />
        </div>
      </div>
    </article>
  )
}

// ─── Featured Card ────────────────────────────────────────────────────────

function FeaturedCard({ report, isSaved, isRead, sentiment, onClick, onSave, className }: CardProps) {
  return (
    <article
      className={cn('flex flex-col gap-4 p-5 rounded-xl cursor-pointer transition-all duration-150', className)}
      style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)' }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--probex-border-active)'
        e.currentTarget.style.transform   = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--probex-border-default)'
        e.currentTarget.style.transform   = ''
      }}
      role="article"
      tabIndex={0}
      aria-label={`Featured research: ${report.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge categoryId={report.categoryId} />
          <FormatBadge format={report.format} />
          {!isRead && <UnreadDot />}
        </div>
        <SaveButton isSaved={isSaved} onClick={onSave} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: sentiment.colorVar }}>{sentiment.label}</span>
        <ConfidenceBadge confidence={report.confidence} />
      </div>

      <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--probex-text-primary)' }}>
        {report.title}
      </h2>
      {report.subtitle && (
        <p className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>{report.subtitle}</p>
      )}

      <p className="text-sm leading-relaxed" style={{ color: 'var(--probex-text-secondary)' }}>
        {report.summary}
      </p>

      <div className="flex items-center gap-3 text-2xs pt-1" style={{ color: 'var(--probex-text-disabled)' }}>
        <span>{report.author.name}</span>
        <span>·</span>
        <span>{formatRelativeTime(report.publishedAt)}</span>
        <span>·</span>
        <ReadTimeBadge minutes={report.estimatedReadMinutes} />
      </div>
    </article>
  )
}

// ─── Compact Card ────────────────────────────────────────────────────────

function CompactCard({ report, isSaved, isRead, sentiment, onClick, onSave, className }: CardProps) {
  return (
    <article
      className={cn('flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-100', className)}
      style={{ borderBottom: '1px solid var(--probex-border)' }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-surface-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
      role="article"
      tabIndex={0}
      aria-label={`Research: ${report.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ background: sentiment.colorVar }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--probex-text-primary)' }}>
          {report.title}
        </p>
        <div className="flex items-center gap-2 text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
          <CategoryBadge categoryId={report.categoryId} small />
          <span>·</span>
          <span>{formatRelativeTime(report.publishedAt)}</span>
        </div>
      </div>
      {!isRead && <UnreadDot />}
      <ConfidenceBadge confidence={report.confidence} small />
      <SaveButton isSaved={isSaved} onClick={onSave} small />
    </article>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  'btc-outlook':         'BTC Outlook',
  'consensus-report':    'Consensus',
  'etf-monitor':         'ETF Monitor',
  'institutional-activity': 'Institutional',
  'macro-signals':       'Macro',
  'market-structure':    'Market Structure',
  'on-chain-signals':    'On-Chain',
  'weekly-brief':        'Weekly Brief',
  'volatility-analysis': 'Volatility',
  'segment-deep-dive':   'Deep Dive',
}

function CategoryBadge({ categoryId, small }: { categoryId: string; small?: boolean }) {
  return (
    <span
      className={cn('font-semibold px-1.5 py-0.5 rounded whitespace-nowrap', small ? 'text-2xs' : 'text-2xs')}
      style={{ background: 'var(--probex-primary-dim)', color: 'var(--probex-primary)' }}
    >
      {CATEGORY_LABELS[categoryId] ?? categoryId}
    </span>
  )
}

const FORMAT_LABELS: Record<string, string> = {
  report: 'Report', 'signal-brief': 'Signal Brief', 'data-brief': 'Data Brief',
  outlook: 'Outlook', monitor: 'Monitor', alert: 'Alert',
}

function FormatBadge({ format }: { format: string }) {
  return (
    <span className="text-2xs px-1.5 py-0.5 rounded" style={{ background: 'var(--probex-surface-2)', color: 'var(--probex-text-muted)' }}>
      {FORMAT_LABELS[format] ?? format}
    </span>
  )
}

function UnreadDot() {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: 'var(--probex-primary)' }}
      aria-label="Unread"
      role="status"
    />
  )
}

function ReadTimeBadge({ minutes }: { minutes: number }) {
  return (
    <span className="text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
      {minutes} min read
    </span>
  )
}

function ConfidenceBadge({ confidence, small }: { confidence: string; small?: boolean }) {
  const color = CONFIDENCE_COLORS[confidence as keyof typeof CONFIDENCE_COLORS] ?? 'var(--probex-text-muted)'
  return (
    <span
      className={cn('font-semibold rounded px-1.5 py-0.5 capitalize', small ? 'text-2xs' : 'text-xs')}
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
    >
      {confidence}
    </span>
  )
}

function SaveButton({ isSaved, onClick, small }: { isSaved: boolean; onClick: (e: MouseEvent) => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={isSaved ? 'Unsave report' : 'Save report'}
      aria-pressed={isSaved}
      className="cursor-pointer transition-colors duration-100 flex-shrink-0"
      style={{ color: isSaved ? 'var(--probex-warning)' : 'var(--probex-text-muted)' }}
      onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.color = 'var(--probex-warning)' }}
      onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.color = 'var(--probex-text-muted)' }}
    >
      <svg width={small ? 12 : 14} height={small ? 12 : 14} viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
  )
}

// ─── Internal type ────────────────────────────────────────────────────────

interface CardProps {
  report:     ResearchReport
  isSaved:    boolean
  isRead:     boolean
  sentiment:  { label: string; colorVar: string }
  onClick:    () => void
  onSave:     (e: MouseEvent) => void
  className?: string | undefined
}
