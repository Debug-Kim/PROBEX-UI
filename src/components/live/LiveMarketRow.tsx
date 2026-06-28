'use client'

/**
 * LiveMarketRow
 *
 * Renders a single market in the Live Markets table.
 * Flashes the changed value (probability or consensus) on each tick.
 * Flash is CSS-driven; prefers-reduced-motion skips it entirely.
 *
 * Receives MergedMarketView from parent (already computed via
 * selectMergedMarketMemo) — no per-row store subscription so only
 * the row whose data changed re-renders.
 */

import { useRef, useEffect, useState } from 'react'
import type { MergedMarketView } from '@/lib/realtime/types'
import { formatPercent } from '@/lib/utils'

// Direction indicator for delta
function DeltaArrow({ bps }: { bps: number | null }) {
  if (bps === null || Math.abs(bps) < 5) return null
  const up = bps > 0
  return (
    <span
      aria-label={up ? 'Up' : 'Down'}
      style={{
        color: up ? 'var(--probex-yes)' : 'var(--probex-no)',
        fontSize: 10,
        marginLeft: 2,
      }}
    >
      {up ? '▲' : '▼'}
    </span>
  )
}

// Recommendation badge
const REC_STYLE: Record<
  string,
  { bg: string; color: string; border: string }
> & { hold: { bg: string; color: string; border: string } } = {
  strong_buy_yes: {
    bg: 'color-mix(in srgb, var(--probex-yes) 18%, transparent)',
    color: 'var(--probex-yes)',
    border: 'color-mix(in srgb, var(--probex-yes) 40%, transparent)',
  },
  buy_yes: {
    bg: 'color-mix(in srgb, var(--probex-yes) 10%, transparent)',
    color: 'var(--probex-yes)',
    border: 'color-mix(in srgb, var(--probex-yes) 25%, transparent)',
  },
  hold: {
    bg: 'var(--probex-surface-2)',
    color: 'var(--probex-text-muted)',
    border: 'var(--probex-border)',
  },
  buy_no: {
    bg: 'color-mix(in srgb, var(--probex-no) 10%, transparent)',
    color: 'var(--probex-no)',
    border: 'color-mix(in srgb, var(--probex-no) 25%, transparent)',
  },
  strong_buy_no: {
    bg: 'color-mix(in srgb, var(--probex-no) 18%, transparent)',
    color: 'var(--probex-no)',
    border: 'color-mix(in srgb, var(--probex-no) 40%, transparent)',
  },
}

function RecommendationBadge({
  level,
  label,
}: {
  level: string
  label: string
}) {
  const s = REC_STYLE[level] ?? REC_STYLE['hold']
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// Flash hook — fires briefly when a watched value changes
function useFlash(value: number, color: string): string {
  const prevRef = useRef(value)
  const [flashColor, setFlashColor] = useState<string>('transparent')

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlashColor(color)
      const t = setTimeout(() => setFlashColor('transparent'), 600)
      prevRef.current = value
      return () => clearTimeout(t)
    }
    return undefined
  }, [value, color])

  return flashColor
}

interface LiveMarketRowProps {
  view: MergedMarketView
  onSelect?: (id: string) => void
}

export function LiveMarketRow({ view, onSelect }: LiveMarketRowProps) {
  const probFlash = useFlash(
    view.probability,
    'color-mix(in srgb, var(--probex-primary) 18%, transparent)',
  )
  const consensusFlash = useFlash(
    view.consensusScore,
    'color-mix(in srgb, var(--probex-consensus-high) 18%, transparent)',
  )

  const edgeColor =
    view.edge > 0 ? 'var(--probex-yes)' : view.edge < 0 ? 'var(--probex-no)' : 'var(--probex-text-muted)'

  return (
    <tr
      onClick={() => onSelect?.(view.id as string)}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        borderBottom: '1px solid var(--probex-border)',
      }}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          onSelect(view.id as string)
        }
      }}
    >
      {/* Market question */}
      <td
        style={{
          padding: '10px 16px',
          fontSize: 13,
          color: 'var(--probex-text-primary)',
          maxWidth: 300,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {view.question}
      </td>

      {/* Consensus score — dominant */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--probex-primary)',
          textAlign: 'right',
          transition: 'background-color 0.6s ease',
          backgroundColor: consensusFlash,
        }}
      >
        {(view.consensusScore * 100).toFixed(0)}
      </td>

      {/* Probability — secondary */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: 13,
          color: 'var(--probex-text-primary)',
          textAlign: 'right',
          transition: 'background-color 0.6s ease',
          backgroundColor: probFlash,
        }}
      >
        {formatPercent(view.probability)}
        <DeltaArrow bps={view.deltaBps} />
      </td>

      {/* Edge */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: 13,
          fontWeight: 600,
          color: edgeColor,
          textAlign: 'right',
        }}
      >
        {view.edge > 0 ? '+' : ''}{view.edge.toFixed(1)}
      </td>

      {/* Recommendation */}
      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
        <RecommendationBadge
          level={view.recommendation.level}
          label={view.recommendation.label}
        />
      </td>

      {/* Live indicator */}
      <td style={{ padding: '10px 12px', textAlign: 'center', width: 40 }}>
        {view.isLive && (
          <span
            aria-label="Live data"
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--probex-yes)',
            }}
          />
        )}
      </td>
    </tr>
  )
}
