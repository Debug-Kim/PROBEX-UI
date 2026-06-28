/**
 * Stream provider factory.
 *
 * Returns MockStreamProvider.
 * swap: replace MockStreamProvider with RealWebSocketProvider here
 * — zero UI changes required.
 */

import { MockStreamProvider } from './MockStreamProvider'
import type { IMarketStreamService } from '@/lib/realtime/types'

export function getStreamProvider(): IMarketStreamService {
  return new MockStreamProvider()
}

export { MockStreamProvider }
