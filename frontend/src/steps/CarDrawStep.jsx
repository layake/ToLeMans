import { useState, useRef } from 'react'

const API = '/api'

function carRating(c) {
  return Math.round(c.performance * 0.5 + c.reliability * 0.5)
}
function ratingColor(v) {
  return v >= 88 ? '#1a8f4e' : v >= 83 ? '#1f6fb2' : '#c0392b'
}

const SPIN_NAMES = [
  'Porsche 956', 'Audi R8', 'Ferrari 499P', 'Mazda 787B', 'Peugeot 905',
  'Toyota GR010', 'Jaguar XJR-9', 'Sauber C9', 'BMW V12 LMR', 'McLaren F1 GTR',
]

function CarCard({ car, onSelect, budgetLeft, t }) {
  const rating = carRating(car)
  const color = ratingColor(rating)
  const cost = car.cost || 0
  const tooExpensive = cost > budgetLeft

  return (
    <div className={`draw-card flipped ${tooExpensive ? 'too-expensive' : ''}`} style={{ opacity: tooExpensive ? 0.5 : 1 }}>
      <div className="draw-card-face draw-card-back">
        <div className="draw-card-back-icon">🏎️</div>
      </div>
      <div className="draw-card-face draw-card-front">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
          <div>
            <div className="card-year">{car.year}</div>
            <div className="card-era">{car.era}</div>
          </div>
          <div className="rating-badge" style={{ background: color + '1a', border: `1px solid ${color}55` }}>
            <span className="rating-num" style={{ color }}>{rating}</span>
            <span className="rating-lbl" style={{ color }}>{t('note')}</span>
          </div>
        </div>
        <div className="card-name" style={{ marginTop: 8 }}>{car.name}</div>
        <div className="card-subtitle">{car.constructor}</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
          {[['PERF', car.performance], ['FIAB', car.reliability]].map(([lbl, val]) => (
            <div key={lbl} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1 }}>{lbl}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: ratingColor(val), fontWeight: 700 }}>{val}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${val}%`, background: ratingColor(val), borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 14, padding: '8px 12px',
          background: tooExpensive ? 'rgba(216,58,44,0.12)' : 'rgba(232,181,63,0.1)',
          border: `1px solid ${tooExpensive ? 'rgba(216,58,44,0.4)' : 'rgba(232,181,63,0.3)'}`,
          borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2 }}>{t('cost') || 'COÛT'}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: tooExpensive ? '#c0392b' : '#e8b53f', letterSpacing: 1 }}>
            {cost}M€
          </span>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 12, width: '100%' }}
          disabled={tooExpensive}
          onClick={() => onSelect(car)}
        >
          {tooExpensive ? (t('budget_too_low') || 'BUDGET INSUFFISANT') : t('btn_choose')}
        </button>
      </div>
    </div>
  )
}

export default function CarDrawStep({ carNum, excludeIds, budgetLeft, rerolls, onReroll, onSelect, t }) {
  const [options, setOptions] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [spinName, setSpinName] = useState('')
  const spinRef = useRef(null)

  async function fetchOptionsWithRetry(tries = 8) {
    for (let i = 0; i < tries; i++) {
      try {
        const res = await fetch(`${API}/draw/car`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exclude: excludeIds || [], budget_left: budgetLeft }),
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        if (!data || data.error || !data.options) throw new Error(data?.error || 'no options')
        return data
      } catch (e) {
        if (i === tries - 1) throw e
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }

  async function drawCar() {
    setPhase('spinning')
    setOptions(null)

    let stopped = false
    let speed = 50
    const minReveal = Date.now() + 1500
    const spin = () => {
      if (stopped) return
      setSpinName(SPIN_NAMES[Math.floor(Math.random() * SPIN_NAMES.length)])
      speed = Math.min(speed * 1.08, 130)
      spinRef.current = setTimeout(spin, speed)
    }
    spin()

    const reveal = (data) => {
      const wait = Math.max(0, minReveal - Date.now())
      setTimeout(() => {
        stopped = true
        if (spinRef.current) clearTimeout(spinRef.current)
        setOptions(data.options)
        setPhase('revealed')
      }, wait)
    }

    try {
      reveal(await fetchOptionsWithRetry())
    } catch (e) {
      console.error('draw failed', e)
      try { reveal(await fetchOptionsWithRetry()) }
      catch (e2) {
        stopped = true
        if (spinRef.current) clearTimeout(spinRef.current)
        setPhase('idle')
      }
    }
  }

  function rerollCar() {
    if (rerolls <= 0) return
    onReroll()
    drawCar()
  }

  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">{carNum === 1 ? t('car_eyebrow_1') : t('car_eyebrow_2')}</div>
        <div className="step-title">{t('car_title')} {carNum}</div>
        <div className="step-desc">{t('car_desc')}</div>
      </div>

      <div className="draw-area">
        {phase === 'idle' && (
          <button className="btn-draw" onClick={drawCar}>{t('btn_draw')}</button>
        )}

        {phase === 'spinning' && (
          <div className="roll-window">
            <div className="roll-item">
              <div className="card-year" style={{ opacity: 0.5 }}>————</div>
              <div className="card-name" style={{ opacity: 0.7 }}>{spinName}</div>
            </div>
          </div>
        )}

        {phase === 'revealed' && options && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14, width: '100%',
            }}>
              {options.map((c, i) => (
                <CarCard key={c.id + i} car={c} onSelect={onSelect} budgetLeft={budgetLeft} t={t} />
              ))}
            </div>

            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn btn-secondary" onClick={rerollCar} disabled={rerolls <= 0}>
                🔄 {t('btn_reroll')} ({rerolls})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
