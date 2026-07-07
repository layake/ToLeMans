import { VERSION, BUILD_DATE } from '../version'

const STRATS = [
  { key: 'attaque', icon: '⚡', relay: '2h' },
  { key: 'equilibre', icon: '⚖️', relay: '3h' },
  { key: 'conservation', icon: '🛡️', relay: '4h' },
]

const C1 = '#7ad0ff'
const C2 = '#e8b53f'

function StartingGrid() {
  const GRID_ROWS = 10
  const playerRows = [2, 3]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2px, 0.6vw, 5px)', alignItems: 'center' }}>
      <div style={{ fontSize: 'clamp(8px, 2vw, 11px)', color: 'rgba(244,239,227,0.55)', letterSpacing: 3, marginBottom: 'clamp(4px, 1vw, 8px)', fontFamily: 'var(--font-mono)' }}>GRILLE · APERÇU</div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 'clamp(16px, 4vw, 28px)', height: 2, background: 'rgba(244,239,227,0.5)' }} />
        <div style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', color: 'rgba(244,239,227,0.6)', fontFamily: 'var(--font-mono)' }}>S</div>
        <div style={{ width: 'clamp(16px, 4vw, 28px)', height: 2, background: 'rgba(244,239,227,0.5)' }} />
      </div>

      {Array.from({ length: GRID_ROWS }).map((_, i) => {
        const isP1 = i === playerRows[0]
        const isP2 = i === playerRows[1]
        const pos = i * 2 + 1
        const cellW = 'clamp(18px, 5vw, 28px)'
        const cellH = 'clamp(12px, 3vw, 18px)'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2px, 0.5vw, 4px)' }}>
            <div style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', color: 'rgba(244,239,227,0.45)', fontFamily: 'var(--font-mono)', width: 'clamp(12px, 3vw, 18px)', textAlign: 'right' }}>P{pos}</div>
            <div style={{
              width: cellW, height: cellH, borderRadius: 3,
              border: isP1 ? `1.5px solid ${C1}` : '1px solid rgba(244,239,227,0.18)',
              background: isP1 ? 'rgba(122,208,255,0.25)' : (i % 3 === 0 ? 'rgba(244,239,227,0.06)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP1 && <div style={{ width: 'clamp(4px, 1.2vw, 7px)', height: 'clamp(4px, 1.2vw, 7px)', borderRadius: '50%', background: C1 }} />}</div>
            <div style={{ width: 1, height: cellH, background: 'rgba(244,239,227,0.12)' }} />
            <div style={{
              width: cellW, height: cellH, borderRadius: 3,
              border: isP2 ? `1.5px solid ${C2}` : '1px solid rgba(244,239,227,0.18)',
              background: isP2 ? 'rgba(232,181,63,0.2)' : (i % 2 === 1 ? 'rgba(244,239,227,0.05)' : 'transparent'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{isP2 && <div style={{ width: 'clamp(4px, 1.2vw, 7px)', height: 'clamp(4px, 1.2vw, 7px)', borderRadius: '50%', background: C2 }} />}</div>
            <div style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', color: 'rgba(244,239,227,0.45)', fontFamily: 'var(--font-mono)', width: 'clamp(12px, 3vw, 18px)' }}>P{pos + 1}</div>
          </div>
        )
      })}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginTop: 4 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(244,239,227,0.3)' }} />)}
      </div>
      <div style={{ fontSize: 'clamp(7px, 1.8vw, 9px)', color: 'rgba(244,239,227,0.35)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>+30</div>
    </div>
  )
}

function CarColumn({ label, color, side }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 'clamp(9px, 2.2vw, 12px)', letterSpacing: 2, color: color,
        marginBottom: 'clamp(6px, 1.5vw, 12px)', fontFamily: 'var(--font-mono)',
        textAlign: side === 'left' ? 'left' : 'right', fontWeight: 700,
      }}>{label}</div>

      <div style={{
        border: `1px dashed ${color}88`, borderRadius: 7,
        padding: 'clamp(6px, 1.5vw, 11px) clamp(7px, 1.8vw, 12px)',
        background: `${color}18`, marginBottom: 'clamp(6px, 1.5vw, 10px)',
        textAlign: side === 'left' ? 'left' : 'right',
      }}>
        <div style={{ fontSize: 'clamp(9px, 2.2vw, 12px)', color: color, letterSpacing: 1, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>— — —</div>
        <div style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', color: 'rgba(244,239,227,0.5)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>P — F —</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 1vw, 7px)' }}>
        {['P1', 'P2', 'P3'].map(p => (
          <div key={p} style={{
            display: 'flex', alignItems: 'center', gap: 'clamp(3px, 0.8vw, 6px)',
            flexDirection: side === 'right' ? 'row-reverse' : 'row',
          }}>
            <div style={{ width: 'clamp(5px, 1.2vw, 8px)', height: 'clamp(5px, 1.2vw, 8px)', borderRadius: '50%', border: `1px solid ${color}88`, flexShrink: 0 }} />
            <div style={{ fontSize: 'clamp(8px, 2vw, 11px)', color: 'rgba(244,239,227,0.55)', fontFamily: 'var(--font-mono)' }}>{p} · —</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeStep({ onStartFree, onStartDaily, dailyDone, budget, t }) {
  return (
    <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', padding: '8px 0 24px', fontFamily: 'var(--font-mono)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px', marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 32px)', letterSpacing: 4, color: 'var(--cream)', lineHeight: 1 }}>TO LE MANS</div>
          <div style={{ fontSize: 'clamp(8px, 2vw, 11px)', letterSpacing: 3, color: 'rgba(244,239,227,0.6)', marginTop: 5 }}>24H · 1923 — 2025</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'clamp(8px, 2vw, 10px)', color: 'rgba(244,239,227,0.55)', letterSpacing: 2 }}>BUDGET</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 5vw, 24px)', color: 'var(--gold)', letterSpacing: 1, lineHeight: 1 }}>{budget || 280}M€</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(244,239,227,0.15)', margin: 'clamp(8px, 2vw, 14px) 0 clamp(12px, 3vw, 20px)' }} />

      {/* 3 colonnes */}
      <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 14px)', alignItems: 'flex-start', marginBottom: 'clamp(14px, 3.5vw, 22px)' }}>
        <CarColumn label="V1" color={C1} side="left" />
        <StartingGrid />
        <CarColumn label="V2" color={C2} side="right" />
      </div>

      {/* Stratégies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'clamp(4px, 1vw, 8px)', marginBottom: 'clamp(12px, 3vw, 18px)' }}>
        {STRATS.map(s => (
          <div key={s.key} style={{
            border: '1px solid rgba(244,239,227,0.18)', borderRadius: 6,
            padding: 'clamp(5px, 1.2vw, 9px) 4px',
            textAlign: 'center', color: 'rgba(244,239,227,0.6)', fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: 'clamp(13px, 3.5vw, 18px)' }}>{s.icon}</div>
            <div style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', marginTop: 3, letterSpacing: 1 }}>{t('strat_' + s.key + '_name').toUpperCase()}</div>
            <div style={{ fontSize: 'clamp(7px, 1.6vw, 9px)', opacity: 0.55, marginTop: 2 }}>{s.relay}</div>
          </div>
        ))}
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(7px, 1.8vw, 11px)', marginBottom: 'clamp(12px, 3vw, 18px)' }}>
        <button onClick={onStartFree} style={{
          background: 'var(--cream)', borderRadius: 8,
          padding: 'clamp(13px, 3.2vw, 17px)',
          textAlign: 'center', fontWeight: 900,
          fontSize: 'clamp(13px, 3.5vw, 16px)',
          color: 'var(--blue-deep)', letterSpacing: 3, border: 'none',
          cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-display)',
        }}>
          {t('home_btn_free')}
        </button>
        <button onClick={onStartDaily} style={{
          border: '1px solid rgba(244,239,227,0.3)', borderRadius: 8,
          padding: 'clamp(11px, 2.8vw, 14px)',
          textAlign: 'center',
          fontSize: 'clamp(10px, 2.5vw, 13px)',
          color: 'rgba(244,239,227,0.85)', letterSpacing: 2,
          background: 'transparent', cursor: 'pointer', width: '100%',
          fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>📅</span>
          <span>{t('home_btn_daily')}</span>
          {dailyDone && <span style={{ fontSize: 'clamp(8px, 2vw, 11px)', color: 'var(--gold)' }}>✓</span>}
        </button>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(8px, 2vw, 14px)' }}>
        <span style={{ fontSize: 'clamp(9px, 2.2vw, 12px)', color: 'rgba(244,239,227,0.5)', letterSpacing: 2 }}>
          69 écuries · 55 voitures · 7 époques
        </span>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', fontSize: 'clamp(8px, 2vw, 10px)', color: 'rgba(244,239,227,0.35)', letterSpacing: 1 }}>
        TO LE MANS · {VERSION} · {BUILD_DATE}
      </div>
    </div>
  )
}
