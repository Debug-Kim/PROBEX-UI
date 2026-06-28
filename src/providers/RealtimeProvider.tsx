'use client'

/**
 * RealtimeProvider
 *
 * Owns the single StreamClient for the application session.
 * Mounts alongside ThemeProvider / QueryProvider / StoreProvider in
 * src/providers/index.ts.
 *
 * When ENABLE_REALTIME_MARKETS is false this component renders children
 * immediately without touching the stream layer — existing earlier builds
 * behaviour is completely unchanged.
 */

import React, { useEffect, useRef } from 'react'
import { FEATURES } from '@/config/features'
import { StreamClient } from '@/lib/realtime/client'
import { getStreamProvider } from '@/lib/realtime/providers'
import { useLiveStore } from '@/store/liveStore'

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const clientRef = useRef<StreamClient | null>(null)
  const setConnectionStatus = useLiveStore((s) => s.setConnectionStatus)
  const setLatencyMs = useLiveStore((s) => s.setLatencyMs)
  const ingestEvent = useLiveStore((s) => s.ingestEvent)
  const autoConnect = useLiveStore((s) => s.autoConnect)
  const reset = useLiveStore((s) => s.reset)

  useEffect(() => {
    // Feature flag guard — do nothing when live markets disabled
    if (!FEATURES.ENABLE_REALTIME_MARKETS) return

    if (!autoConnect) return

    const provider = getStreamProvider()
    const client = new StreamClient(provider, {
      heartbeatIntervalMs: 15_000,
      backoffBaseMs: 1_000,
      backoffMaxMs: 30_000,
      backoffJitter: 0.3,
      maxRetries: 10,
    })
    clientRef.current = client

    // Wire status changes into liveStore
    const removeStatus = client.addStatusHandler((status) => {
      setConnectionStatus(status)
      if (status === 'open') {
        // Update latency from client after pong
        setLatencyMs(client.getLatencyMs())
      }
    })

    // Wire every stream event into liveStore
    const removeEvent = client.addEventHandler((event) => {
      ingestEvent(event)
    })

    // Connect — provider emits snapshot immediately
    client.connect()

    return () => {
      removeStatus()
      removeEvent()
      client.disconnect()
      reset()
      clientRef.current = null
    }
  }, [autoConnect, ingestEvent, reset, setConnectionStatus, setLatencyMs])

  return <>{children}</>
}
