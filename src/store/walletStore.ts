'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WalletProvider, TransactionType, TransactionStatus } from '@/types/wallet'
import type { FundingMethodId } from '@/mock/fundingMethods'

// ─── State ────────────────────────────────────────────────────────────────

export type FundingFlow = 'deposit' | 'withdraw' | 'transfer' | null

interface WalletStoreState {
  /** Mock connection toggle — UI only, no real wallet connection */
  isConnected:        boolean
  /** Which connector the user "selected" in the connect modal */
  selectedProvider:   WalletProvider | null
  /** Connect wallet modal open state */
  isConnectModalOpen: boolean

  /** Active funding flow panel */
  activeFundingFlow:  FundingFlow
  /** Selected funding method for deposit/withdrawal */
  selectedFundingMethod: FundingMethodId | null
  /** Deposit amount input (string to allow partial input) */
  depositAmount:      string
  /** Withdrawal amount input */
  withdrawalAmount:   string
  /** Transfer amount input */
  transferAmount:     string
  /** Transfer destination (mock address or username) */
  transferDestination: string

  /** Transaction history filters */
  txTypeFilter:       TransactionType | null
  txStatusFilter:     TransactionStatus | null
  txSearch:           string

  /** Wallet preferences */
  hideSmallBalances:  boolean
  defaultFundingMethod: FundingMethodId | null
}

// ─── Actions ─────────────────────────────────────────────────────────────

interface WalletStoreActions {
  toggleConnection:      () => void
  setSelectedProvider:   (p: WalletProvider | null) => void
  openConnectModal:      () => void
  closeConnectModal:     () => void

  setFundingFlow:        (flow: FundingFlow) => void
  setFundingMethod:      (id: FundingMethodId | null) => void
  setDepositAmount:      (v: string) => void
  setWithdrawalAmount:   (v: string) => void
  setTransferAmount:     (v: string) => void
  setTransferDestination:(v: string) => void
  resetFundingInputs:    () => void

  setTxTypeFilter:       (type: TransactionType | null) => void
  setTxStatusFilter:     (status: TransactionStatus | null) => void
  setTxSearch:           (q: string) => void
  resetTxFilters:        () => void

  toggleHideSmallBalances: () => void
  setDefaultFundingMethod: (id: FundingMethodId | null) => void
}

type WalletStore = WalletStoreState & WalletStoreActions

const DEFAULT_STATE: WalletStoreState = {
  isConnected:           true,   // mock: start "connected" for demo purposes
  selectedProvider:      'metamask',
  isConnectModalOpen:    false,

  activeFundingFlow:     null,
  selectedFundingMethod: null,
  depositAmount:         '',
  withdrawalAmount:      '',
  transferAmount:        '',
  transferDestination:   '',

  txTypeFilter:          null,
  txStatusFilter:        null,
  txSearch:              '',

  hideSmallBalances:     false,
  defaultFundingMethod:  'usdc-polygon',
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      toggleConnection: () =>
        set((s) => ({ isConnected: !s.isConnected, isConnectModalOpen: false })),

      setSelectedProvider: (p) => set({ selectedProvider: p }),

      openConnectModal:  () => set({ isConnectModalOpen: true }),
      closeConnectModal: () => set({ isConnectModalOpen: false }),

      setFundingFlow: (flow) =>
        set({ activeFundingFlow: flow }),

      setFundingMethod: (id) => set({ selectedFundingMethod: id }),

      setDepositAmount:       (v) => set({ depositAmount: v }),
      setWithdrawalAmount:    (v) => set({ withdrawalAmount: v }),
      setTransferAmount:      (v) => set({ transferAmount: v }),
      setTransferDestination: (v) => set({ transferDestination: v }),

      resetFundingInputs: () =>
        set({
          depositAmount: '', withdrawalAmount: '', transferAmount: '',
          transferDestination: '', selectedFundingMethod: null, activeFundingFlow: null,
        }),

      setTxTypeFilter:   (type)   => set({ txTypeFilter: type }),
      setTxStatusFilter: (status) => set({ txStatusFilter: status }),
      setTxSearch:       (q)      => set({ txSearch: q }),

      resetTxFilters: () =>
        set({ txTypeFilter: null, txStatusFilter: null, txSearch: '' }),

      toggleHideSmallBalances: () =>
        set((s) => ({ hideSmallBalances: !s.hideSmallBalances })),

      setDefaultFundingMethod: (id) => set({ defaultFundingMethod: id }),
    }),
    {
      name:       'probex-wallet',
      storage:    createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isConnected:          s.isConnected,
        selectedProvider:     s.selectedProvider,
        hideSmallBalances:    s.hideSmallBalances,
        defaultFundingMethod: s.defaultFundingMethod,
      }),
    },
  ),
)

// ─── Selector hooks ────────────────────────────────────────────────────────

export const useIsWalletConnected   = () => useWalletStore((s) => s.isConnected)
export const useSelectedProvider    = () => useWalletStore((s) => s.selectedProvider)
export const useIsConnectModalOpen  = () => useWalletStore((s) => s.isConnectModalOpen)
export const useActiveFundingFlow   = () => useWalletStore((s) => s.activeFundingFlow)
export const useSelectedFundingMethod = () => useWalletStore((s) => s.selectedFundingMethod)
export const useHideSmallBalances   = () => useWalletStore((s) => s.hideSmallBalances)
