'use client'

/**
 * useWatchlist
 * ────────────
 * Reactive access to the user's market watchlist.
 *
 * Persistence contract (unchanged from WatchlistButton):
 *   - sessionStorage key: 'probex_watchlist'
 *   - value: JSON-encoded string[] of market IDs
 *
 * This hook is the single source of truth for the Watchlist page. It reads
 * and writes the exact same storage contract that WatchlistButton uses on
 * MarketCard / MarketHeader, so adding a star anywhere and viewing the
 * watchlist stay in sync within the session.
 *
 * SSR-safe: storage is only read after mount (isHydrated guards first paint
 * so the empty state never flashes during hydration).
 *
 * Sync: listens for the native `storage` event (cross-tab) and a lightweight
 * same-tab `probex:watchlist` event dispatched on every local mutation, so
 * multiple consumers reconcile without prop drilling.
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'probex_watchlist'
const SYNC_EVENT = 'probex:watchlist'

function readStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function writeStorage(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new Event(SYNC_EVENT))
  } catch {
    /* storage unavailable — noop */
  }
}

export interface UseWatchlistResult {
  /** Watchlisted market IDs in insertion order. */
  ids: string[]
  /** Number of watchlisted markets. */
  count: number
  /** True once storage has been read on the client (avoids hydration flash). */
  isHydrated: boolean
  /** Whether a given market ID is watchlisted. */
  has: (id: string) => boolean
  /** Add a market to the watchlist (no-op if already present). */
  add: (id: string) => void
  /** Remove a market from the watchlist. */
  remove: (id: string) => void
  /** Remove every market from the watchlist. */
  clear: () => void
}

export function useWatchlist(): UseWatchlistResult {
  const [ids, setIds] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIds(readStorage())
    setIsHydrated(true)

    const sync = () => setIds(readStorage())
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync()
    }

    window.addEventListener(SYNC_EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SYNC_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // Mutators always derive from fresh storage to avoid stale closures.
  const commit = useCallback((next: string[]) => {
    writeStorage(next)
    setIds(next)
  }, [])

  const add = useCallback((id: string) => {
    const current = readStorage()
    if (!current.includes(id)) commit([...current, id])
  }, [commit])

  const remove = useCallback((id: string) => {
    commit(readStorage().filter((x) => x !== id))
  }, [commit])

  const clear = useCallback(() => {
    commit([])
  }, [commit])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, count: ids.length, isHydrated, has, add, remove, clear }
}
