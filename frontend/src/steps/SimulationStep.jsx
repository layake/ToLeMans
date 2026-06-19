import { useState, useEffect } from 'react'

function scoreClass(score, dnf) {
  if (dnf) return 'dnf'
  if (score >= 90) return 'dominant'
  if (score >= 84) return 'solid'
  if (score >= 76) return 'ok'
  return 'bad'
}

function eventClass(event) {
  if (!event) return ''
  const goodIds = ['bon_stint', 'depassement', 'nuit_rapide']
  return goodIds.includes(event.id) ? 'sim-event-pos' : 'sim-event-neg'
}

export default function SimulationStep({ result, game, onDone }) {
  const [visiblePhases, setVisiblePhases] = useState(0)
  const [done, setDone] = useState(false)

  const phases = result.phase_summaries || []

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setVisiblePhases(idx)
      if (idx >= phases.length) {
        clearInterval(interval)
        setTimeout(() => setDone(true), 600)
      }
    }, 1200)
    return () => clearInterval(interval)
  }, [phases.length])

  return (
    <div>
      <div className="step-header">
        <div className="step-label">Course en cours</div>
        <div className="step-title">24 Heures du Mans</div>
        <div className="step-desc">
          {game.car1?.name} &amp; {game.car2?.name} — {game.director?.name} au muret
        </div>
      </div>

      <div className="sim-phase-list">
        {phases.map((phase, i) => (
          <div
            key={phase.phase_id}
            className={`sim-phase ${i < visiblePhases ? 'visible' : ''}`}
          >
            <div className="sim-phase-header">
              <div className="sim-phase-name">{phase.label}</div>
              <div className="sim-phase-hours">{phase.hours}</div>
            </div>
            <div className="sim-cars">
              <div className="sim-car">
                <div className="sim-car-label">🏎️ {game.car1?.name}</div>
                <div className={`sim-car-result ${scoreClass(phase.car1_score, phase.car1_dnf)}`}>
                  {phase.car1_dnf ? '⛔ ABANDON' : phase.car1_label}
                  {!phase.car1_dnf && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginLeft: 8, color: 'var(--text-muted)' }}>
                      {Math.round(phase.car1_score)}
                    </span>
                  )}
                </div>
                {phase.car1_event && (
                  <div className={`sim-event ${eventClass(phase.car1_event)}`}>
                    {phase.car1_event.label} — {phase.car1_event.description}
                  </div>
                )}
              </div>
              <div className="sim-car">
                <div className="sim-car-label">🏎️ {game.car2?.name}</div>
                <div className={`sim-car-result ${scoreClass(phase.car2_score, phase.car2_dnf)}`}>
                  {phase.car2_dnf ? '⛔ ABANDON' : phase.car2_label}
                  {!phase.car2_dnf && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginLeft: 8, color: 'var(--text-muted)' }}>
                      {Math.round(phase.car2_score)}
                    </span>
                  )}
                </div>
                {phase.car2_event && (
                  <div className={`sim-event ${eventClass(phase.car2_event)}`}>
                    {phase.car2_event.label} — {phase.car2_event.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="btn-row" style={{ marginTop: 28 }}>
          <button className="btn btn-primary btn-big" onClick={onDone}>
            Voir le résultat →
          </button>
        </div>
      )}

      {!done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          Course en cours…
        </div>
      )}
    </div>
  )
}
