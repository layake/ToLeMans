import { useState } from 'react'

const API = '/api'

function StatBar({ label, value, color }) {
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-bg">
        <div
          className={`stat-bar-fill ${color || ''}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="stat-bar-val">{value}</span>
    </div>
  )
}

export default function CarDrawStep({ carNum, excludeIds, rerolls, onReroll, onSelect }) {
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const stepNum = carNum === 1 ? 2 : 3

  async function drawCar() {
    setLoading(true)
    setFlipped(false)
    setCar(null)
    try {
      const res = await fetch(`${API}/draw/car`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude: excludeIds }),
      })
      const data = await res.json()
      setCar(data)
      setTimeout(() => setFlipped(true), 100)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function rerollCar() {
    if (rerolls <= 0) return
    onReroll()
    await drawCar()
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-label">Étape {stepNum} / 11</div>
        <div className="step-title">Voiture {carNum}</div>
        <div className="step-desc">
          Tirez une voiture au hasard. Elle détermine votre époque de référence.
          La BOP équilibre toutes les machines.
        </div>
      </div>

      <div className="draw-area">
        {!car && !loading && (
          <button className="btn-draw" onClick={drawCar}>
            TIRER
          </button>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-text">TIRAGE EN COURS…</div>
          </div>
        )}

        {car && (
          <>
            <div className="draw-card-container">
              <div className={`draw-card ${flipped ? 'flipped' : ''}`}>
                <div className="draw-card-face draw-card-back">
                  <div className="draw-card-back-icon">🏎️</div>
                  <span>Tirage...</span>
                </div>
                <div className="draw-card-face draw-card-front">
                  <div className="card-year">{car.year}</div>
                  <div className="card-era">{car.era}</div>
                  <div className="card-name">{car.name}</div>
                  <div className="card-subtitle">{car.constructor}</div>
                  <div className="stat-bar-wrap" style={{ marginTop: 12 }}>
                    <StatBar label="PERF" value={car.performance} color="" />
                    <StatBar label="FIAB" value={car.reliability} color="green" />
                  </div>
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button
                className="btn btn-secondary"
                onClick={rerollCar}
                disabled={rerolls <= 0}
              >
                🔄 Reroll ({rerolls})
              </button>
              <button
                className="btn btn-primary btn-big"
                onClick={() => onSelect(car)}
              >
                Choisir →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
