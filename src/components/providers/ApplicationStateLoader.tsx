'use client'

// ApplicationStateLoader — renders null, mounts once in DashboardLayout.
// Calls every engine service hook and syncs each resolved ServiceState<T>
// into the global ApplicationStore so that ALL other hooks and components
// can read engine data without issuing their own HTTP requests.
//
// This is the ONLY place in the application that calls raw useEngine* hooks.
// EngineChainProbe (admin dev panel) is intentionally excluded — it issues
// independent requests to verify the full chain in isolation.

import { useEffect }           from 'react'
import { useApplicationStore } from '@/store/applicationStore'
import {
  useEngineHealth,
  useEngineRuntime,
  useEngineStats,
  useEngineConfig,
  useEngineSurvival,
  useEnginePriceHistory,
  useEngineMarkets,
  useEnginePositions,
  useEngineEvents,
  useEngineEdges,
} from '@/hooks/useServices'

export function ApplicationStateLoader() {
  const updateEngine = useApplicationStore((s) => s.updateEngine)

  // All hooks must be called unconditionally (React rules of hooks).
  const health       = useEngineHealth()
  const runtime      = useEngineRuntime()
  const stats        = useEngineStats()
  const config       = useEngineConfig()
  const survival     = useEngineSurvival()
  const priceHistory = useEnginePriceHistory()
  const markets      = useEngineMarkets()
  const positions    = useEnginePositions()
  const events       = useEngineEvents()
  const edges        = useEngineEdges()

  // Each effect syncs one endpoint state into the store whenever it settles.
  useEffect(() => { updateEngine({ health }) },       [health,       updateEngine])
  useEffect(() => { updateEngine({ runtime }) },      [runtime,      updateEngine])
  useEffect(() => { updateEngine({ stats }) },        [stats,        updateEngine])
  useEffect(() => { updateEngine({ config }) },       [config,       updateEngine])
  useEffect(() => { updateEngine({ survival }) },     [survival,     updateEngine])
  useEffect(() => { updateEngine({ priceHistory }) }, [priceHistory, updateEngine])
  useEffect(() => { updateEngine({ markets }) },      [markets,      updateEngine])
  useEffect(() => { updateEngine({ positions }) },    [positions,    updateEngine])
  useEffect(() => { updateEngine({ events }) },       [events,       updateEngine])
  useEffect(() => { updateEngine({ edges }) },        [edges,        updateEngine])

  return null
}
