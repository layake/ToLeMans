import { useState, useRef } from 'react'

const API = '/api'

function carRating(c) {
  return Math.round(c.performance * 0.5 + c.reliability * 0.5)
}
function ratingColor(v) {
  return v >= 88 ? '#1a8f4e' : v >= 83 ? '#1f6fb2' : '#c0392b'
}

// Noms aléatoires pour l'effet machine à sous pendant le roll
const SPIN_NAMES = [
  'Porsche 956', 'Audi R8', 'Ferrari 499P', 'Mazda 787B', 'Peugeot 905',
  'Toyota GR010', 'Jaguar XJR-9', 'Sauber C9', 'BMW V12 LMR', 'McLaren F1 GTR',
]

export default function CarDrawStep({ carNum, excludeIds, rerolls, onReroll, onSelect, t }) {
  const [car, setCar] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | spinning | revealed
  const [spinName, setSpinName] = useState('')
  const spinRef = useRef(null)
  const stepNum = carNum === 1 ? 2 : 3

  async function fetchCarWithRetry(tries = 4) {
    for (let i = 0; i < tries; i++) {
      try {
        const res = await fetch(`${API}/draw/car`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exclude: excludeIds || [] }),
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        if (!data || data.error) throw new Error(data?.error || 'no data')
        return data
      } catch (e) {
        if (i === tries - 1) throw e
        await new Promise(r => setTimeout(r, 250 * (i + 1)))
      }
    }
  }

  async function drawCar() {
    setPhase('spinning')
    setCar(null)

    let speed = 50
    let elapsed = 0
    const spin = () => {
      setSpinName(SPIN_NAMES[Math.floor(Math.random() * SPIN_NAMES.length)])
      elapsed += speed
      speed *= 1.12
      if (elapsed < 1400) {
        spinRef.current = setTimeout(spin, speed)
      }
    }
    spin()

    const startedAt = Date.now()
    try {
      const data = await fetchCarWithRetry()
      const wait = Math.max(0, 1500 - (Date.now() - startedAt))
      setTimeout(() => {
        if (spinRef.current) clearTimeout(spinRef.current)
        setCar(data)
        setPhase('revealed')
      }, wait)
    } catch (e) {
      console.error('draw failed after retries', e)
      if (spinRef.current) clearTimeout(spinRef.current)
      setPhase('idle')
    }
  }

  function rerollCar() {
    if (rerolls <= 0) return
    onReroll()
    drawCar()
  }

  const rating = car ? carRating(car) : 0
  const color = car ? ratingColor(rating) : '#f5c542'

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

        {phase === 'revealed' && car && (
          <>
            <div className="draw-card-container">
              <div className="draw-card flipped">
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
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={rerollCar} disabled={rerolls <= 0}>
                🔄 {t('btn_reroll')} ({rerolls})
              </button>
              <button className="btn btn-primary btn-big" onClick={() => onSelect(car)}>
                {t('btn_choose')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
