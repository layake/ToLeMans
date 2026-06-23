import { VERSION, BUILD_DATE } from '../version'

const STRATS = [
  { key: 'attaque', icon: '⚡', relay: '2h' },
  { key: 'equilibre', icon: '⚖️', relay: '3h' },
  { key: 'conservation', icon: '🛡️', relay: '4h' },
]

function StartingGrid() {
  const GRID_ROWS = 10
  const playerRows = [2, 3]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.3)', letterSpacing: 3, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>GRILLE · 50</div>

      <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}>
        <div style={{ width: 30, height: 2, background: 'rgba(244,239,227,0.4)' }} />
        <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.4)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>START</div>
        <div style={{ width: 30, height: 2, background: 'rgba(244,239,227,0.4)' }} />
      </div>

      {Array.from({ length: GRID_ROWS }).map((_, i) => {
        const isP1 = i === playerRows[0]
        const isP2 = i === playerRows[1]
        const pos = i * 2 + 1
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.25)', fontFamily: 'var(--font-mono)', width: 12, textAlign: 'right' }}>P{pos}</div>
            <div style={{
              width: 20, height: 12, borderRadius: 3,
              border: isP1 ? '1px solid rgba(78,163,217,0.8)' : '1px solid rgba(244,239,227,0.1)',
              background: isP1 ? 'rgba(78,163,217,0.2)' : (i % 3 === 0 ? 'rgba(244,239,227,0.04)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP1 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ea3d9' }} />}</div>
            <div style={{ width: 1, height: 12, background: 'rgba(244,239,227,0.06)' }} />
            <div style={{
              width: 20, height: 12, borderRadius: 3,
              border: isP2 ? '1px solid rgba(232,181,63,0.8)' : '1px solid rgba(244,239,227,0.1)',
              background: isP2 ? 'rgba(232,181,63,0.15)' : (i % 2 === 1 ? 'rgba(244,239,227,0.03)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP2 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8b53f' }} />}</div>
            <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.25)', fontFamily: 'var(--font-mono)', width: 12 }}>P{pos + 1}</div>
          </div>
        )
      })}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: 2 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(244,239,227,0.18)' }} />
        ))}
      </div>
      <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.18)', fontFamily: 'var(--font-mono)' }}>+30</div>
    </div>
  )
}

function CarColumn({ label, color, side }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 8, letterSpacing: 2, color: color, opacity: 0.75,
        marginBottom: 10, fontFamily: 'var(--font-mono)',
        textAlign: side === 'left' ? 'left' : 'right', fontWeight: 700,
      }}>{label}</div>

      <div style={{
        border: `1px dashed ${color}55`, borderRadius: 6, padding: '8px 9px',
        background: `${color}10`, marginBottom: 8,
        textAlign: side === 'left' ? 'left' : 'right',
      }}>
        <div style={{ fontSize: 8, color: `${color}66`, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>— — —</div>
        <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.2)', letterSpacing: 1, marginTop: 2, fontFamily: 'var(--font-mono)' }}>PERF — · FIAB —</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['P1', 'P2', 'P3'].map(p => (
          <div key={p} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            flexDirection: side === 'right' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              border: `1px solid ${color}55`, flexShrink: 0,
            }} />
            <div style={{ fontSize: 8, color: 'rgba(244,239,227,0.25)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{p} · —</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeStep({ onStartFree, onStartDaily, dailyDone, budget, t }) {
  return (
    <div style={{
      width: '100%', maxWidth: 460, margin: '0 auto',
      fontFamily: "var(--font-mono)",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24, letterSpacing: 4, color: 'var(--cream)',
            lineHeight: 1,
          }}>TO LE MANS</div>
          <div style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(244,239,227,0.4)', marginTop: 4 }}>24H · 1923 — 2025</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 7, color: 'rgba(244,239,227,0.35)', letterSpacing: 2 }}>BUDGET</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold)', letterSpacing: 1 }}>{budget || 280}M€</div>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{ height: 1, background: 'rgba(244,239,227,0.1)', margin: '8px 0 16px' }} />

      {/* Zone principale : 3 colonnes */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
        <CarColumn label="VOITURE 1" color="#4ea3d9" side="left" />
        <StartingGrid />
        <CarColumn label="VOITURE 2" color="#e8b53f" side="right" />
      </div>

      {/* Aperçu stratégie + DT (statique, juste pour montrer) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 12 }}>
        {STRATS.map(s => (
          <div key={s.key} style={{
            border: '1px solid rgba(244,239,227,0.1)', borderRadius: 5, padding: '6px 4px',
            textAlign: 'center', fontSize: 7, letterSpacing: 1,
            color: 'rgba(244,239,227,0.35)', fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: 12 }}>{s.icon}</div>
            <div style={{ marginTop: 2 }}>{t('strat_' + s.key + '_name').toUpperCase().slice(0, 8)}</div>
            <div style={{ fontSize: 6, opacity: 0.5 }}>{s.relay}</div>
          </div>
        ))}
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <button onClick={onStartFree} style={{
          background: 'var(--cream)', borderRadius: 8, padding: '15px',
          textAlign: 'center', fontWeight: 900, fontSize: 14,
          color: 'var(--blue-deep)', letterSpacing: 3, border: 'none',
          cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-display)',
        }}>
          {t('home_btn_free')}
        </button>
        <button onClick={onStartDaily} style={{
          border: '1px solid rgba(244,239,227,0.2)', borderRadius: 8, padding: '12px',
          textAlign: 'center', fontSize: 11, color: 'rgba(244,239,227,0.6)',
          letterSpacing: 2, background: 'transparent', cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>📅</span>
          <span>{t('home_btn_daily')}</span>
          {dailyDone && <span style={{ fontSize: 9, color: 'var(--gold)' }}>✓</span>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 9, color: 'rgba(244,239,227,0.25)', letterSpacing: 2, fontFamily: 'var(--font-mono)' }}>
          69 écuries · 55 voitures · 7 époques
        </span>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(244,239,227,0.2)', letterSpacing: 1 }}>
        TO LE MANS · {VERSION} · {BUILD_DATE}
      </div>
    </div>
  )
}
