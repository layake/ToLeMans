import { VERSION, BUILD_DATE } from '../version'

const STRATS = [
  { key: 'attaque', icon: '⚡', relay: '2h' },
  { key: 'equilibre', icon: '⚖️', relay: '3h' },
  { key: 'conservation', icon: '🛡️', relay: '4h' },
]

// Couleurs vives pour bonne lisibilité sur fond bleu
const C1 = '#7ad0ff'  // cyan clair (V1)
const C2 = '#e8b53f'  // doré (V2)

function StartingGrid() {
  const GRID_ROWS = 10
  const playerRows = [2, 3]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
      <div style={{ fontSize: 10, color: 'rgba(244,239,227,0.55)', letterSpacing: 3, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>GRILLE</div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 28, height: 2, background: 'rgba(244,239,227,0.5)' }} />
        <div style={{ fontSize: 9, color: 'rgba(244,239,227,0.6)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>START</div>
        <div style={{ width: 28, height: 2, background: 'rgba(244,239,227,0.5)' }} />
      </div>

      {Array.from({ length: GRID_ROWS }).map((_, i) => {
        const isP1 = i === playerRows[0]
        const isP2 = i === playerRows[1]
        const pos = i * 2 + 1
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'rgba(244,239,227,0.45)', fontFamily: 'var(--font-mono)', width: 16, textAlign: 'right' }}>P{pos}</div>
            <div style={{
              width: 26, height: 16, borderRadius: 3,
              border: isP1 ? `1px solid ${C1}` : '1px solid rgba(244,239,227,0.18)',
              background: isP1 ? 'rgba(122,208,255,0.25)' : (i % 3 === 0 ? 'rgba(244,239,227,0.06)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP1 && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C1 }} />}</div>
            <div style={{ width: 1, height: 16, background: 'rgba(244,239,227,0.12)' }} />
            <div style={{
              width: 26, height: 16, borderRadius: 3,
              border: isP2 ? `1px solid ${C2}` : '1px solid rgba(244,239,227,0.18)',
              background: isP2 ? 'rgba(232,181,63,0.2)' : (i % 2 === 1 ? 'rgba(244,239,227,0.05)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP2 && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C2 }} />}</div>
            <div style={{ fontSize: 10, color: 'rgba(244,239,227,0.45)', fontFamily: 'var(--font-mono)', width: 16 }}>P{pos + 1}</div>
          </div>
        )
      })}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginTop: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(244,239,227,0.3)' }} />
        ))}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(244,239,227,0.35)', fontFamily: 'var(--font-mono)' }}>+30 voitures</div>
    </div>
  )
}

function CarColumn({ label, color, side }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 11, letterSpacing: 2, color: color,
        marginBottom: 12, fontFamily: 'var(--font-mono)',
        textAlign: side === 'left' ? 'left' : 'right', fontWeight: 700,
      }}>{label}</div>

      <div style={{
        border: `1px dashed ${color}88`, borderRadius: 7, padding: '10px 11px',
        background: `${color}18`, marginBottom: 10,
        textAlign: side === 'left' ? 'left' : 'right',
      }}>
        <div style={{ fontSize: 11, color: color, letterSpacing: 1, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>— — —</div>
        <div style={{ fontSize: 9, color: 'rgba(244,239,227,0.5)', letterSpacing: 1, marginTop: 4, fontFamily: 'var(--font-mono)' }}>PERF — · FIAB —</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['P1', 'P2', 'P3'].map(p => (
          <div key={p} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flexDirection: side === 'right' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              border: `1px solid ${color}88`, flexShrink: 0,
            }} />
            <div style={{ fontSize: 10, color: 'rgba(244,239,227,0.55)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{p} · —</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeStep({ onStartFree, onStartDaily, dailyDone, budget, t }) {
  return (
    <div style={{
      width: '100%', maxWidth: 460, margin: '0 auto', padding: '8px 0 24px',
      fontFamily: "var(--font-mono)",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px', marginBottom: 6 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30, letterSpacing: 4, color: 'var(--cream)',
            lineHeight: 1,
          }}>TO LE MANS</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(244,239,227,0.6)', marginTop: 5 }}>24H · 1923 — 2025</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(244,239,227,0.55)', letterSpacing: 2 }}>BUDGET</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', letterSpacing: 1, lineHeight: 1 }}>{budget || 280}M€</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(244,239,227,0.15)', margin: '12px 0 18px' }} />

      {/* 3 colonnes */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 22 }}>
        <CarColumn label="VOITURE 1" color={C1} side="left" />
        <StartingGrid />
        <CarColumn label="VOITURE 2" color={C2} side="right" />
      </div>

      {/* Stratégies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 18 }}>
        {STRATS.map(s => (
          <div key={s.key} style={{
            border: '1px solid rgba(244,239,227,0.18)', borderRadius: 6, padding: '8px 4px',
            textAlign: 'center', letterSpacing: 1,
            color: 'rgba(244,239,227,0.6)', fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 9, marginTop: 4 }}>{t('strat_' + s.key + '_name').toUpperCase()}</div>
            <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>{s.relay}</div>
          </div>
        ))}
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        <button onClick={onStartFree} style={{
          background: 'var(--cream)', borderRadius: 8, padding: '17px',
          textAlign: 'center', fontWeight: 900, fontSize: 16,
          color: 'var(--blue-deep)', letterSpacing: 3, border: 'none',
          cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-display)',
        }}>
          {t('home_btn_free')}
        </button>
        <button onClick={onStartDaily} style={{
          border: '1px solid rgba(244,239,227,0.3)', borderRadius: 8, padding: '14px',
          textAlign: 'center', fontSize: 12, color: 'rgba(244,239,227,0.85)',
          letterSpacing: 2, background: 'transparent', cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>📅</span>
          <span>{t('home_btn_daily')}</span>
          {dailyDone && <span style={{ fontSize: 10, color: 'var(--gold)' }}>✓</span>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: 'rgba(244,239,227,0.5)', letterSpacing: 2, fontFamily: 'var(--font-mono)' }}>
          69 écuries · 55 voitures · 7 époques
        </span>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(244,239,227,0.35)', letterSpacing: 1 }}>
        TO LE MANS · {VERSION} · {BUILD_DATE}
      </div>
    </div>
  )
}
