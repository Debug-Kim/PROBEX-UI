'use client'

// Global ⌘K command palette and unified search. One surface to:
//   • jump to any page (Navigation)
//   • search every market (Markets)
//   • run quick actions (Actions)
//
// Mounted once globally (DashboardLayout). The top-bar SearchBar and ⌘K both
// open it, so search is unified rather than duplicated. Fully keyboard driven:
// ↑/↓ to move, ↵ to run, esc to close.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useMarkets } from '@/hooks/useServices'
import { getSegmentMeta } from '@/config/marketSegments'
import { ROUTES, MARKET_DETAIL_PATH } from '@/config/constants'
import { EmptyState } from '@/components/ui/EmptyState'

type Group = 'Navigation' | 'Markets' | 'Actions'

interface Cmd {
  id:        string
  label:     string
  sublabel?: string
  group:     Group
  run:       () => void
}

const PAGES: Array<{ label: string; href: string }> = [
  { label: 'Overview',          href: ROUTES.HOME },
  { label: 'Markets',           href: ROUTES.MARKETS },
  { label: 'Live Markets',      href: ROUTES.LIVE },
  { label: 'Portfolio',         href: ROUTES.PORTFOLIO },
  { label: 'Positions',         href: ROUTES.POSITIONS },
  { label: 'Watchlist',         href: ROUTES.WATCHLIST },
  { label: 'Consensus Engine',  href: ROUTES.CONSENSUS },
  { label: 'Analytics',         href: ROUTES.ANALYTICS },
  { label: 'Research',          href: ROUTES.RESEARCH },
  { label: 'Wallet',            href: ROUTES.WALLET },
  { label: 'Settings',          href: ROUTES.SETTINGS },
]

const GROUP_ORDER: Group[] = ['Navigation', 'Markets', 'Actions']

export function CommandPalette() {
  const open          = useUIStore((s) => s.commandOpen)
  const close         = useUIStore((s) => s.closeCommand)
  const toggle        = useUIStore((s) => s.toggleCommand)
  const openActivity  = useUIStore((s) => s.openActivity)
  const router        = useRouter()

  const allMarkets = useMarkets().data?.data ?? []

  const [query, setQuery] = useState('')
  const [sel, setSel]     = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  useKeyboardShortcut('k', () => toggle(), { meta: true })

  const commands = useMemo<Cmd[]>(() => {
    const q = query.trim().toLowerCase()
    const nav: Cmd[] = PAGES.map((p) => ({
      id: `nav-${p.href}`, label: p.label, sublabel: p.href, group: 'Navigation',
      run: () => { router.push(p.href); close() },
    }))
    const markets: Cmd[] = allMarkets.map((m) => ({
      id: `mkt-${m.id as string}`, label: m.title, sublabel: getSegmentMeta(m.segment).label, group: 'Markets',
      run: () => { router.push(MARKET_DETAIL_PATH(m.id as string)); close() },
    }))
    const actions: Cmd[] = [
      { id: 'act-activity', label: 'Open activity feed', group: 'Actions', run: () => { close(); openActivity() } },
      { id: 'act-settings', label: 'Open settings',      group: 'Actions', run: () => { router.push(ROUTES.SETTINGS); close() } },
    ]
    const all = [...nav, ...markets, ...actions]
    if (!q) return [...nav.slice(0, 5), ...markets.slice(0, 5), ...actions]
    return all.filter((c) => c.label.toLowerCase().includes(q) || (c.sublabel?.toLowerCase().includes(q) ?? false)).slice(0, 24)
  }, [query, router, close, openActivity, allMarkets])

  // Reset state when opened.
  useEffect(() => {
    if (open) { setQuery(''); setSel(0); const t = window.setTimeout(() => inputRef.current?.focus(), 30); return () => window.clearTimeout(t) }
    return undefined
  }, [open])

  useEffect(() => { setSel(0) }, [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-cmd-index="${sel}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!open) return null

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown')      { e.preventDefault(); setSel((s) => Math.min(s + 1, commands.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter')     { e.preventDefault(); commands[sel]?.run() }
    else if (e.key === 'Escape')    { e.preventDefault(); close() }
  }

  let idx = -1

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette" className="fixed inset-0" style={{ zIndex: 80 }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} onClick={close} aria-hidden="true" />

      <div
        className="absolute left-1/2 -translate-x-1/2 top-[12vh] w-[92vw] max-w-[560px] rounded-xl overflow-hidden animate-fade-in-up"
        style={{ background: 'var(--probex-surface)', border: '1px solid var(--probex-border-default)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        onKeyDown={onKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4" style={{ borderBottom: '1px solid var(--probex-border)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ color: 'var(--probex-text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets, pages, actions…"
            aria-label="Command palette search"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            className="flex-1 bg-transparent outline-none text-sm py-3.5 min-w-0"
            style={{ color: 'var(--probex-text-primary)' }}
          />
          <kbd className="text-2xs rounded px-1.5 py-0.5 font-mono flex-shrink-0" style={{ background: 'var(--probex-surface-3)', color: 'var(--probex-text-disabled)', border: '1px solid var(--probex-border)' }}>esc</kbd>
        </div>

        {/* Results */}
        <div id="cmd-list" role="listbox" ref={listRef} style={{ maxHeight: '52vh', overflowY: 'auto' }}>
          {commands.length === 0 ? (
            <EmptyState size="sm" title="No results" description="Try a market name, page, or action." />
          ) : (
            GROUP_ORDER.map((g) => {
              const items = commands.filter((c) => c.group === g)
              if (items.length === 0) return null
              return (
                <div key={g}>
                  <div className="px-4 pt-3 pb-1 text-2xs font-bold uppercase tracking-wider" style={{ color: 'var(--probex-text-disabled)' }}>{g}</div>
                  {items.map((c) => {
                    idx++
                    const myIdx = idx
                    const active = myIdx === sel
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-cmd-index={myIdx}
                        onMouseMove={() => setSel(myIdx)}
                        onClick={() => c.run()}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors duration-75"
                        style={{ background: active ? 'var(--probex-primary-dim)' : 'transparent' }}
                      >
                        <span className="text-xs font-medium truncate" style={{ color: active ? 'var(--probex-primary)' : 'var(--probex-text-primary)' }}>{c.label}</span>
                        {c.sublabel && <span className="ml-auto text-2xs truncate flex-shrink-0 max-w-[45%]" style={{ color: 'var(--probex-text-muted)' }}>{c.sublabel}</span>}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2" style={{ borderTop: '1px solid var(--probex-border)', background: 'var(--probex-surface-2)' }}>
          <Hint keys="↑↓" label="Navigate" />
          <Hint keys="↵" label="Open" />
          <Hint keys="esc" label="Close" />
        </div>
      </div>
    </div>
  )
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--probex-text-disabled)' }}>
      <kbd className="rounded px-1 py-0.5 font-mono" style={{ background: 'var(--probex-surface-3)', border: '1px solid var(--probex-border)' }}>{keys}</kbd>
      {label}
    </span>
  )
}
