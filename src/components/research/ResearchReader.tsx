'use client'

import { useEffect, useState, useCallback } from 'react'
import { useResearchStore } from '@/store'
import { useResearchReport, useMarkets } from '@/hooks/useServices'
import { EmptyState } from '@/components/ui'
import { MarkdownBody } from './MarkdownBody'
import type { ResearchReport, ResearchSignal } from '@/types/research'
import { ROUTES } from '@/config/constants'

// ─── Signal card ──────────────────────────────────────────────────────────────

function SignalCard({ signal }: { signal: ResearchSignal }) {
  const direction =
    signal.type === 'bullish-flag'
      ? 'bullish'
      : signal.type === 'bearish-flag'
        ? 'bearish'
        : 'neutral'
  const directionColor =
    direction === 'bullish'
      ? 'var(--probex-yes)'
      : direction === 'bearish'
        ? 'var(--probex-no)'
        : 'var(--probex-text-muted)'

  const strengthLabel =
    signal.strength === 'strong'
      ? 'Strong'
      : signal.strength === 'moderate'
        ? 'Moderate'
        : 'Weak'

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid var(--probex-border)',
        background: 'var(--probex-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--probex-text-primary)',
          }}
        >
          {signal.label}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              color: directionColor,
              background: `${directionColor}18`,
              textTransform: 'capitalize',
            }}
          >
            {direction}
          </span>
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--probex-text-muted)',
              background: 'var(--probex-surface-2)',
              textTransform: 'capitalize',
            }}
          >
            {strengthLabel}
          </span>
        </div>
      </div>
      {signal.description && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--probex-text-secondary)',
            lineHeight: '1.55',
            margin: 0,
          }}
        >
          {signal.description}
        </p>
      )}
    </div>
  )
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: ResearchReport['confidence'] }) {
  const color =
    confidence === 'high'
      ? 'var(--probex-consensus-high)'
      : confidence === 'medium'
        ? 'var(--probex-consensus-med)'
        : 'var(--probex-consensus-low)'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        color,
        background: `${color}18`,
        textTransform: 'capitalize',
      }}
    >
      {confidence} confidence
    </span>
  )
}

// ─── Sentiment badge ──────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: ResearchReport['sentiment'] }) {
  const color =
    sentiment === 'bullish'
      ? 'var(--probex-yes)'
      : sentiment === 'bearish'
        ? 'var(--probex-no)'
        : 'var(--probex-text-muted)'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 700,
        color,
        background: `${color}18`,
        textTransform: 'capitalize',
      }}
    >
      {sentiment}
    </span>
  )
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${ROUTES.RESEARCH}?report=${reportId}`
        : ''
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } else {
      // Fallback for environments without clipboard API
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [reportId])

  return (
    <button
      onClick={handleShare}
      aria-label="Copy link to this report"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid var(--probex-border)',
        background: copied ? 'var(--probex-primary-dim)' : 'transparent',
        color: copied ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Share
        </>
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResearchReader() {
  const { activeReportId, savedReportIds, closeReport, toggleSave, markRead } =
    useResearchStore()

  // Mark as read on mount, unconditionally before any early return
  useEffect(() => {
    if (activeReportId) {
      markRead(activeReportId)
    }
  }, [activeReportId, markRead])

  const report: ResearchReport | undefined = useResearchReport(activeReportId ?? '').data ?? undefined
  const markets = useMarkets().data?.data ?? []
  const marketTitles = Object.fromEntries(markets.map((m) => [m.id as string, m.title]))

  const isSaved = activeReportId ? savedReportIds.includes(activeReportId) : false

  if (!report) {
    return (
      <EmptyState
        title="Report not found"
        description="This report may have been removed or the link is invalid."
      />
    )
  }

  const publishedDate = new Date(report.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
      aria-label={`Research report: ${report.title}`}
    >
      {/* ── Sticky header ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--probex-bg)',
          borderBottom: '1px solid var(--probex-border)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Back button */}
        <button
          onClick={closeReport}
          aria-label="Back to research list"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--probex-text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5M5 12l7 7M5 12l7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Research
        </button>

        {/* Title — truncated on small screens */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--probex-text-primary)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {report.title}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShareButton reportId={report.id} />
          <button
            onClick={() => toggleSave(report.id)}
            aria-label={isSaved ? 'Unsave this report' : 'Save this report'}
            aria-pressed={isSaved}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--probex-border)',
              background: isSaved ? 'var(--probex-primary-dim)' : 'transparent',
              color: isSaved ? 'var(--probex-primary)' : 'var(--probex-text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              aria-hidden="true"
            >
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 24px 40px',
        }}
      >
        {/* ── Meta row ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--probex-primary)',
              background: 'var(--probex-primary-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {report.category}
          </span>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--probex-text-secondary)',
              background: 'var(--probex-surface-2)',
              textTransform: 'capitalize',
            }}
          >
            {report.format}
          </span>
          <SentimentBadge sentiment={report.sentiment} />
          <ConfidenceBadge confidence={report.confidence} />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--probex-text-muted)',
              marginLeft: 'auto',
            }}
          >
            {report.readTime} min read
          </span>
        </div>

        {/* ── Title + subtitle ── */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--probex-text-primary)',
            lineHeight: '1.3',
            margin: '0 0 8px',
          }}
        >
          {report.title}
        </h1>
        {report.subtitle && (
          <p
            style={{
              fontSize: '15px',
              color: 'var(--probex-text-secondary)',
              lineHeight: '1.5',
              margin: '0 0 14px',
            }}
          >
            {report.subtitle}
          </p>
        )}

        {/* ── Author + date ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--probex-border)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--probex-gradient-brand)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {report.author.avatarLabel}
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--probex-text-primary)',
              }}
            >
              {report.author.name}
            </div>
            <div
              style={{ fontSize: '11px', color: 'var(--probex-text-muted)' }}
            >
              {publishedDate}
            </div>
          </div>
        </div>

        {/* ── Thesis box ── */}
        {report.thesis && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '10px',
              border: '1px solid var(--probex-primary)',
              background: 'var(--probex-primary-dim)',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--probex-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              Core Thesis
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--probex-text-primary)',
                fontWeight: 600,
                lineHeight: '1.6',
                margin: '0 0 10px',
              }}
            >
              {report.thesis.statement}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: 'var(--probex-text-secondary)',
              }}
            >
              {report.thesis.timeHorizon && (
                <span>
                  <strong>Horizon:</strong> {report.thesis.timeHorizon}
                </span>
              )}
              {report.thesis.confidence !== undefined && (
                <span>
                  <strong>Confidence:</strong> {report.thesis.confidence}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Key points ── */}
        {report.keyPoints && report.keyPoints.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--probex-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Key Points
            </h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: '0',
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {report.keyPoints.map((point, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    fontSize: '14px',
                    color: 'var(--probex-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--probex-primary)',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    →
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Full report body — rendered via MarkdownBody ── */}
        {report.body && (
          <div style={{ marginBottom: '36px' }}>
            <MarkdownBody content={report.body} />
          </div>
        )}

        {/* ── Intelligence signals ── */}
        {report.signals && report.signals.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--probex-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Intelligence Signals
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {report.signals.map((signal, i) => (
                <SignalCard key={i} signal={signal} />
              ))}
            </div>
          </div>
        )}

        {/* ── Featured markets ── */}
        {report.featuredMarkets && report.featuredMarkets.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--probex-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '12px',
              }}
            >
              Featured Markets
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {report.featuredMarkets.map((marketId) => {
                const title = marketTitles[marketId]
                if (!title) return null
                return (
                <a
                  key={marketId}
                  href={`${ROUTES.MARKETS}/${marketId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--probex-border)',
                    background: 'var(--probex-surface)',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                      'var(--probex-primary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                      'var(--probex-border)')
                  }
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--probex-text-primary)',
                    }}
                  >
                    {title}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    style={{ color: 'var(--probex-text-muted)', flexShrink: 0 }}
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Sources footer ── */}
        {report.sources && report.sources.length > 0 && (
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid var(--probex-border)',
            }}
          >
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--probex-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}
            >
              Sources
            </h2>
            <ol
              style={{
                margin: 0,
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {report.sources.map((source, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '12px',
                    color: 'var(--probex-text-muted)',
                    lineHeight: '1.5',
                  }}
                >
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--probex-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span>{source.label}</span>
                  )}
                  {source.type && (
                    <span style={{ color: 'var(--probex-text-disabled)' }}>
                      {' '}— {source.type}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </article>
  )
}
