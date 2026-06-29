// Premium institutional footer. Trust-building copy, link groups,
// and social icons. Server component (no interactivity).

import Link             from 'next/link'
import { ProbexMark }   from '@/components/ui/ProbexMark'

const LINK_GROUPS = {
  Platform: [
    { label: 'Markets',    href: '/dashboard/markets' },
    { label: 'Research',   href: '/dashboard/research' },
    { label: 'Analytics',  href: '/dashboard/analytics' },
    { label: 'Live',       href: '/dashboard/live' },
  ],
  Resources: [
    { label: 'API Docs',   href: '/api/docs' },
    { label: 'Status',     href: 'https://status.probex.io' },
    { label: 'Contact',    href: '/contact' },
    { label: 'Careers',    href: '/careers' },
  ],
  Legal: [
    { label: 'Terms',       href: '/legal/terms' },
    { label: 'Privacy',     href: '/legal/privacy' },
    { label: 'Disclosures', href: '/legal/disclosures' },
    { label: 'About',       href: '/about' },
  ],
} as const

// ─── Social icons (inline SVG, no external deps) ─────────────────────────────

function SocialIcon({ kind }: { kind: 'github' | 'discord' | 'x' }) {
  const common = { width: 16, height: 16, fill: 'currentColor', viewBox: '0 0 24 24' }
  if (kind === 'github') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
      </svg>
    )
  }
  if (kind === 'discord') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a18.3 18.3 0 0 1 5.6 2.8 16.5 16.5 0 0 0-16.6 0 18.3 18.3 0 0 1 5.6-2.8L9.6 3a19.8 19.8 0 0 0-4.9 1.4C1.6 8.9.8 13.3 1.2 17.6a20 20 0 0 0 6 3l.4-.6a13 13 0 0 1-2-1c.2-.1.3-.2.5-.3a14.1 14.1 0 0 0 12 0l.5.3a13 13 0 0 1-2 1l.4.6a20 20 0 0 0 6-3c.5-5-.8-9.3-3.1-13.2zM8.5 14.9c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
      </svg>
    )
  }
  return (
    <svg {...common} aria-hidden="true">
      <path d="M18.2 2.2h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.9-6 6.9H1.6l7.7-8.8L1.1 2.2h6.8l4.7 6.3 5.6-6.3zm-1.2 17.5h1.8L7.1 4.1H5.2l11.8 15.6z"/>
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop:     '1px solid var(--probex-border)',
        marginTop:     56,
        paddingTop:    36,
        paddingBottom: 32,
        paddingLeft:   20,
        paddingRight:  20,
        background:    'linear-gradient(180deg, transparent, color-mix(in srgb, var(--probex-surface) 40%, transparent))',
      }}
    >
      <div style={{ maxWidth: 1920, margin: '0 auto' }}>

        {/* Top: brand + trust + links */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'space-between' }}>

          {/* Brand column */}
          <div style={{ minWidth: 220, maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <ProbexMark size={26} />
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--probex-text-primary)' }}>
                Probex
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--probex-text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
              Every market is scored by the Probex Consensus Engine — quantitative
              signal, not speculation.
            </p>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--probex-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Built for institutional prediction intelligence.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: 10 }}>
              {(['github', 'discord', 'x'] as const).map(k => (
                <a
                  key={k}
                  href="#"
                  aria-label={k}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 7,
                    background: 'var(--probex-surface-2)',
                    border: '1px solid var(--probex-border)',
                    color: 'var(--probex-text-muted)',
                    textDecoration: 'none',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  className="hover:text-[var(--probex-text-primary)]"
                >
                  <SocialIcon kind={k} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINK_GROUPS).map(([group, links]) => (
            <div key={group} style={{ minWidth: 110 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--probex-text-muted)', marginBottom: 12, textTransform: 'uppercase',
              }}>
                {group}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      style={{ fontSize: 12.5, color: 'var(--probex-text-secondary)', textDecoration: 'none' }}
                      className="hover:text-[var(--probex-text-primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div style={{
          marginTop: 28, paddingTop: 16,
          borderTop: '1px solid var(--probex-border)',
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          {[
            { k: 'Transparent', v: 'Every signal is auditable' },
            { k: 'Real-time',   v: 'Sub-second market data' },
            { k: 'Independent',  v: 'No market-maker conflicts' },
          ].map(item => (
            <div key={item.k} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--probex-positive)' }} />
              <span style={{ fontSize: 11, color: 'var(--probex-text-secondary)' }}>
                <strong style={{ color: 'var(--probex-text-primary)', fontWeight: 600 }}>{item.k}.</strong> {item.v}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: '1px solid var(--probex-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--probex-text-muted)' }}>
            © {year} Probex Inc. All rights reserved.
          </span>
          <span style={{ fontSize: 11, color: 'var(--probex-text-muted)' }}>
            Prediction markets carry risk. This is not financial advice.
          </span>
        </div>
      </div>
    </footer>
  )
}
