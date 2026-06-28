'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn }                from '@/lib/utils'
import { useAccount }        from '@/hooks/useAccount'
import { ConfirmDialog }     from '@/components/ui/Dialog'
import { RoleBadge }         from './RoleBadge'
import { ROUTES }            from '@/config/constants'

/**
 * UserMenu
 * ────────
 * Compact profile control in the top navigation — the terminal element of the
 * navbar flow. Renders a graceful Guest state when signed out (no layout
 * collapse, no disappearing avatar).
 */
export function UserMenu() {
  const [isOpen, setIsOpen]           = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [signingOut, setSigningOut]   = useState(false)
  const containerRef        = useRef<HTMLDivElement>(null)
  const { isGuest, displayName, email, role, initials, logout } = useAccount()

  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false) }
    const onKey   = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [isOpen])

  const openLogoutConfirm = () => { setIsOpen(false); setConfirmOpen(true) }
  const handleLogout = async () => {
    setSigningOut(true)
    await logout()
    setSigningOut(false)
    setConfirmOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* Role badge — signed-in only */}
      {role && <RoleBadge role={role} className="hidden md:inline-flex" />}

      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isGuest ? 'Account menu — signed out' : `Open profile menu for ${displayName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'focus-ring flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold cursor-pointer',
          'transition-all duration-200 active:scale-95',
        )}
        style={isGuest ? {
          background: 'var(--probex-surface-3)',
          color:      'var(--probex-text-muted)',
          border:     `1px solid ${isOpen ? 'var(--probex-border-active)' : 'var(--probex-border-default)'}`,
        } : {
          background: 'var(--probex-gradient-brand)',
          color:      '#050816',
          boxShadow:  isOpen ? '0 0 0 2px var(--probex-bg), 0 0 0 4px var(--probex-primary)' : 'none',
        }}
      >
        {isGuest ? <GuestGlyph /> : <span aria-hidden="true">{initials}</span>}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[230px] rounded-xl overflow-hidden shadow-trading-panel animate-fade-in-up"
          style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border-default)' }}
          role="menu"
          aria-label="User menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--probex-border)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={isGuest
                  ? { background: 'var(--probex-surface-3)', color: 'var(--probex-text-muted)' }
                  : { background: 'var(--probex-gradient-brand)', color: '#050816' }}
                aria-hidden="true"
              >
                {isGuest ? <GuestGlyph /> : initials}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--probex-text-primary)' }}>{displayName}</span>
                <span className="text-xs truncate" style={{ color: 'var(--probex-text-muted)' }}>
                  {isGuest ? 'Not signed in' : email}
                </span>
              </div>
            </div>
            {role && <div className="mt-2"><RoleBadge role={role} /></div>}
          </div>

          {isGuest ? (
            <div className="py-1">
              <Link
                href={ROUTES.LOGIN}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150"
                style={{ color: 'var(--probex-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-primary-dim)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
              >
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">{loginIcon}</span>
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="py-1" role="group">
                {[
                  { href: ROUTES.PORTFOLIO, label: 'Portfolio', icon: portfolioIcon },
                  { href: ROUTES.SETTINGS,  label: 'Settings',  icon: settingsIcon  },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150"
                    style={{ color: 'var(--probex-text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-primary-dim)'; e.currentTarget.style.color = 'var(--probex-text-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--probex-text-secondary)' }}
                  >
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
              <div className="divider" />
              <div className="py-1">
                <button
                  role="menuitem"
                  onClick={openLogoutConfirm}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer text-left"
                  style={{ color: 'var(--probex-negative)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--probex-negative-dim)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
                >
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">{logoutIcon}</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
        loading={signingOut}
        title="Sign out of Probex?"
        description="You'll need to sign in again to access your dashboard, positions, and wallet."
        confirmLabel="Sign Out"
        cancelLabel="Stay signed in"
        tone="danger"
      />
    </div>
  )
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function GuestGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const portfolioIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

const settingsIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const logoutIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const loginIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
