import { useState, useEffect } from 'react'

const API = '/api'

const CONDITION_LABELS = {
  all: '🏆 Toutes conditions',
  night: '🌙 Spécialiste nuit',
  rain: '🌧️ Spécialiste pluie',
  pace: '⚡ Spécialiste vitesse',
  strategy: '🧠 Spécialiste stratégie',
}

export default function DirectorStep({ onSelect }) {
  const [directors, setDirectors] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${API}/directors`)
      .then(r => r.json())
      .then(setDirectors)
      .catch(console.error)
  }, [])

  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">Étape 4 / 11 · Direction</div>
        <div className="step-title">Directeur Technique</div>
        <div className="step-desc">
          Choix libre. Il influence la fiabilité de votre équipe et apporte
          un bonus décisif dans sa spécialité.
        </div>
      </div>

      <div className="director-grid">
        {directors.map(dt => (
          <div
            key={dt.id}
            className={`director-card ${selected?.id === dt.id ? 'selected' : ''}`}
            onClick={() => setSelected(dt)}
          >
            <div className="director-name">{dt.name}</div>
            <div className="director-era">{dt.era}</div>
            <div className="director-specialty">{CONDITION_LABELS[dt.bonus_condition]}</div>
            <div className="director-desc">{dt.description}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span className="tag pos">+{dt.reliability_bonus} fiab.</span>
              <span className="tag pos">+{dt.bonus_value} bonus</span>
            </div>
          </div>
        ))}
      </div>

      <div className="btn-row" style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary btn-big"
          disabled={!selected}
          onClick={() => onSelect(selected)}
        >
          Confirmer →
        </button>
      </div>
    </div>
  )
}
