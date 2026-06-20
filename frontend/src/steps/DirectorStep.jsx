import { useState, useEffect } from 'react'

const API = '/api'



export default function DirectorStep({ onSelect, t }) {
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
        <div className="step-eyebrow">{t('dir_eyebrow')}</div>
        <div className="step-title">{t('dir_title')}</div>
        <div className="step-desc">{t('dir_desc')}</div>
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
            <div className="director-specialty">{({all:'🏆',night:'🌙',rain:'🌧️',pace:'⚡',strategy:'🧠'}[dt.bonus_condition]||'')} {t('cond_'+dt.bonus_condition)}</div>
            <div className="director-desc">{dt.description}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span className="tag pos">+{dt.reliability_bonus} {t('dir_reliability')}</span>
              <span className="tag pos">+{dt.bonus_value} {t('dir_bonus')}</span>
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
          {t('btn_confirm')}
        </button>
      </div>
    </div>
  )
}
