'use client'

// Ephemeral global UI overlay state — the command palette and the global
// activity drawer. Kept separate from feature stores (markets, theme, …) and
// intentionally not persisted: these are transient surfaces.

import { create } from 'zustand'

interface UIState {
  commandOpen:  boolean
  activityOpen: boolean
  openCommand:    () => void
  closeCommand:   () => void
  toggleCommand:  () => void
  openActivity:   () => void
  closeActivity:  () => void
  toggleActivity: () => void
}

export const useUIStore = create<UIState>((set) => ({
  commandOpen:  false,
  activityOpen: false,
  openCommand:    () => set({ commandOpen: true }),
  closeCommand:   () => set({ commandOpen: false }),
  toggleCommand:  () => set((s) => ({ commandOpen: !s.commandOpen })),
  openActivity:   () => set({ activityOpen: true }),
  closeActivity:  () => set({ activityOpen: false }),
  toggleActivity: () => set((s) => ({ activityOpen: !s.activityOpen })),
}))
