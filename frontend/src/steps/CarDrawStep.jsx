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

export default function CarDrawStep({ carNum, excludeIds, rerolls, onReroll, onSelect }) {
  const [car, setCar] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | spinning | revealed
  const [spinName, setSpinName] = useState('')
  const spinRef = useRef(null)
  const stepNum = carNum === 1 ? 2 : 3

  async function drawCar() {
    setPhase('spinning')
    setCar(null)

    // Lance l'effet machine à sous
    let speed = 50
    let elapsed = 0
    const spin = () => {
      setSpinName(SPIN_NAMES[Math.floor(Math.random() * SPIN_NAMES.length)])
      elapsed += speed
      speed *= 1.12 // ralentit progressivement
      if (elapsed < 1400) {
        spinRef.current = setTimeout(spin, speed)
      }
    }
    spin()

    // Fetch en parallèle
    try {
      const res = await fetch(`${API}/draw/car`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude: excludeIds }),
      })
      const data = await res.json()
      // Attendre la fin de l'animation de spin
      setTimeout(() => {
        if (spinRef.current) clearTimeout(spinRef.current)
        setCar(data)
        setPhase('revealed')
      }, 1500)
    } catch (e) { console.error(e); setPhase('idle') }
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
        <div className="step-eyebrow">Étape {stepNum} / 11 · Machine</div>
        <div className="step-title">Voiture {carNum}</div>
        <div className="step-desc">
          Tire une voiture du panthéon du Mans. La BOP équilibre toutes les machines —
          ce sont tes choix qui font la différence.
        </div>
      </div>

      <div className="draw-area">
        {phase === 'idle' && (
          <button className="btn-draw" onClick={drawCar}>TIRER</button>
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
                      <span className="rating-lbl" style={{ color }}>NOTE</span>
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
                🔄 Reroll ({rerolls})
              </button>
              <button className="btn btn-primary btn-big" onClick={() => onSelect(car)}>
                Choisir →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
