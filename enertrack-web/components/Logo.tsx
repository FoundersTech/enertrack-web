// components/Logo.tsx
// Logo EnerTrack — hexágono com relógio interno + wordmark

interface LogoProps {
  size?: number      // tamanho do ícone em px
  showTagline?: boolean
  className?: string
}

export default function Logo({ size = 64, showTagline = false }: LogoProps) {
  const s = size
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Ícone hexagonal */}
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexágono flat-top com cantos arredondados */}
        <path
          d="M50 6
             L88 28
             L88 72
             L50 94
             L12 72
             L12 28
             Z"
          stroke="#00d4a0"
          strokeWidth="6"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Ponteiro das horas (12h) */}
        <line x1="50" y1="50" x2="50" y2="28" stroke="#00d4a0" strokeWidth="5" strokeLinecap="round"/>
        {/* Ponteiro dos minutos (→ direita) */}
        <line x1="50" y1="50" x2="68" y2="62" stroke="#00d4a0" strokeWidth="5" strokeLinecap="round"/>
      </svg>

      {/* Wordmark: "Ener" branco + "Track" verde */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: s * 0.72,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Ener
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: s * 0.72,
          color: '#00d4a0',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          Track
        </span>
      </div>

      {/* Tagline opcional */}
      {showTagline && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: s * 0.18,
          color: 'var(--muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginTop: -8,
        }}>
          Monitore.&nbsp; Otimize.&nbsp; Economize.
        </p>
      )}
    </div>
  )
}