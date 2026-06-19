import { useState } from 'react'

const API = '/api'

function StatBar({ label, value }) {
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-bg">
        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="stat-bar-val">{value}</span>
    </div>
  )
}

export default function PilotDrawStep({ slot, pilotIndex, totalPilots, excludeIds, rerolls, onReroll, onSelect }) {
  const [pilot, setPilot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [localExclude, setLocalExclude] = useState([])
  const stepNum = 5 + pilotIndex

  async function fetchPilot(exclude) {
    setLoading(true)
    setFlipped(false)
    setPilot(null)
    try {
      const res = await fetch(`${API}/draw/pilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude }),
      })
      const data = await res.json()
      if (data.error) {
        console.error(data.error)
        return
      }
      setPilot(data)
      setTimeout(() => setFlipped(true), 100)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function drawPilot() {
    const allExclude = [...excludeIds, ...localExclude]
    fetchPilot(allExclude)
  }

  function rerollPilot() {
    if (rerolls <= 0) return
    onReroll()
    // Exclure aussi le pilote actuellement affiché
    const newLocal = pilot ? [...localExclude, pilot.id] : localExclude
    setLocalExclude(newLocal)
    fetchPilot([...excludeIds, ...newLocal])
  }

  function confirmPilot() {
    setLocalExclude([])
    onSelect(pilot)
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-label">Étape {stepNum} / 11</div>
        <div className="step-title">Pilote {pilotIndex + 1}</div>
        <div className="pilot-slot-info">
          <span className="pilot-slot-car">🏎️ {slot.label.split('—')[0].trim()}</span>
          <span className="pilot-slot-pos">{slot.label.split('—')[1]?.trim()}</span>
        </div>
        <div className="step-desc">
          Tirez un pilote ayant réellement couru au Mans. L'ordre est fixe :
          il sera toujours en piste à ce slot de rotation.
        </div>
      </div>

      <div className="draw-area">
        {!pilot && !loading && (
          <button className="btn-draw" onClick={drawPilot}>
            TIRER
          </button>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-text">TIRAGE EN COURS…</div>
          </div>
        )}

        {pilot && (
          <>
            <div className="draw-card-container">
              <div className={`draw-card ${flipped ? 'flipped' : ''}`}>
                <div className="draw-card-face draw-card-back">
                  <div className="draw-card-back-icon">👤</div>
                  <span>Tirage...</span>
                </div>
                <div className="draw-card-face draw-card-front">
                  <div className="card-year">{pilot.nationality} · {pilot.year}</div>
                  <div className="card-name">{pilot.name}</div>
                  <div className="card-subtitle" style={{ marginBottom: 8 }}>{pilot.profile}</div>
                  <div className="stat-bar-wrap">
                    <StatBar label="PACE" value={pilot.pace} />
                    <StatBar label="NUIT" value={pilot.night_skill} />
                    <StatBar label="ENDU" value={pilot.endurance} />
                    <StatBar label="FIAB" value={pilot.reliability} />
                  </div>
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button
                className="btn btn-secondary"
                onClick={rerollPilot}
                disabled={rerolls <= 0}
              >
                🔄 Reroll ({rerolls})
              </button>
              <button
                className="btn btn-primary btn-big"
                onClick={confirmPilot}
              >
                Confirmer →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
