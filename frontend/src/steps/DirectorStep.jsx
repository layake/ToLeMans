import { useState, useEffect } from 'react'

const API = '/api'



export default function DirectorStep({ onSelect, budgetLeft, t }) {
  const [directors, setDirectors] = useState([])
  
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
        {directors.map(dt => {
          const tooExpensive = (dt.cost || 0) > budgetLeft
          return (
            <div
              key={dt.id}
              className="director-card"
              style={{ opacity: tooExpensive ? 0.45 : 1, cursor: tooExpensive ? 'not-allowed' : 'pointer' }}
              onClick={() => !tooExpensive && onSelect(dt)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="director-name">{dt.name}</div>
                  <div className="director-era">{dt.era}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: tooExpensive ? '#c0392b' : '#e8b53f',
                  fontWeight: 700, padding: '4px 8px',
                  background: tooExpensive ? 'rgba(216,58,44,0.1)' : 'rgba(232,181,63,0.1)',
                  borderRadius: 4,
                }}>
                  {dt.cost || 0}M€
                </div>
              </div>
              <div className="director-specialty">{({all:'🏆',night:'🌙',rain:'🌧️',pace:'⚡',strategy:'🧠'}[dt.bonus_condition]||'')} {t('cond_'+dt.bonus_condition)}</div>
              <div className="director-desc">{dt.description}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span className="tag pos">+{dt.reliability_bonus} {t('dir_reliability')}</span>
                <span className="tag pos">+{dt.bonus_value} {t('dir_bonus')}</span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
