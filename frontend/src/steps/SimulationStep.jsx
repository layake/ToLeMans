import { useState, useEffect } from 'react'

const PHASES = [
  { id: 'depart',        label: 'Départ',       hours: '16h → 20h', icon: '🚦', color: '#f0c040' },
  { id: 'nuit',          label: 'Nuit',          hours: '20h → 00h', icon: '🌙', color: '#6080ff' },
  { id: 'nuit_profonde', label: 'Nuit Profonde', hours: '00h → 04h', icon: '🌑', color: '#4040a0' },
  { id: 'aube',          label: 'Aube',          hours: '04h → 08h', icon: '🌅', color: '#ff8040' },
  { id: 'sprint',        label: 'Sprint Final',  hours: '08h → 16h', icon: '⚡', color: '#40b870' },
]

function scoreClass(score, dnf) {
  if (dnf) return 'dnf'
  if (score >= 90) return 'dominant'
  if (score >= 84) return 'solid'
  if (score >= 76) return 'ok'
  return 'bad'
}

function eventIsGood(event) {
  if (!event) return null
  return ['bon_stint', 'depassement', 'nuit_rapide'].includes(event.id)
}

function PositionBadge({ position, dnf }) {
  if (dnf) return <span style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: 20 }}>DNF</span>
  if (!position) return null
  const color = position === 1 ? '#f0c040' : position <= 3 ? '#40b870' : 'var(--text-dim)'
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color, letterSpacing: 1 }}>
      P{position}
    </span>
  )
}

export default function SimulationStep({ result, game, onDone }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const phases = result.phase_summaries || []
  const totalPhases = phases.length

  const progress = Math.round((visibleCount / totalPhases) * 100)
  const raceHours = [16, 20, 0, 4, 8, 16]

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setVisibleCount(idx)
      if (idx >= totalPhases) {
        clearInterval(interval)
        setTimeout(() => setDone(true), 700)
      }
    }, 1400)
    return () => clearInterval(interval)
  }, [totalPhases])

  return (
    <div>
      <div className="step-header" style={{ marginBottom: 20 }}>
        <div className="step-label">Course en cours</div>
        <div className="step-title">24 Heures du Mans</div>
        <div className="step-desc" style={{ marginBottom: 0 }}>
          {game.director?.name} au muret des stands
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yellow)' }}>
            {progress < 100 ? `${progress}% — Course en cours…` : '🏁 Drapeau à damiers !'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {visibleCount}/{totalPhases} phases
          </span>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f0c040, #40b870)',
            borderRadius: 5,
            transition: 'width 1.2s ease',
          }} />
        </div>
        {/* Phase markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {PHASES.map((ph, i) => (
            <div key={ph.id} style={{ textAlign: 'center', flex: i === 4 ? 2 : 1 }}>
              <div style={{ fontSize: 12, opacity: visibleCount > i ? 1 : 0.3 }}>{ph.icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>{ph.hours.split('→')[0].trim()}</div>
            </div>
          ))}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: done ? 1 : 0.3 }}>🏁</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 1 }}>16h</div>
          </div>
        </div>
      </div>

      {/* Phase cards */}
      <div className="sim-phase-list">
        {phases.map((phase, i) => {
          const phaseMeta = PHASES[i]
          const visible = i < visibleCount
          return (
            <div key={phase.phase_id} className={`sim-phase ${visible ? 'visible' : ''}`}
              style={{ borderLeft: visible ? `3px solid ${phaseMeta?.color || 'var(--yellow)'}` : '3px solid transparent' }}>
              <div className="sim-phase-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{phaseMeta?.icon}</span>
                  <div className="sim-phase-name" style={{ color: phaseMeta?.color }}>{phase.label}</div>
                </div>
                <div className="sim-phase-hours">{phase.hours}</div>
              </div>
              <div className="sim-cars">
                {[
                  { car: game.car1, score: phase.car1_score, label: phase.car1_label, event: phase.car1_event, dnf: phase.car1_dnf },
                  { car: game.car2, score: phase.car2_score, label: phase.car2_label, event: phase.car2_event, dnf: phase.car2_dnf },
                ].map(({ car, score, label, event, dnf }, ci) => (
                  <div key={ci} className="sim-car">
                    <div className="sim-car-label">🏎️ {car?.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <div className={`sim-car-result ${scoreClass(score, dnf)}`}>
                        {dnf ? '⛔ ABANDON' : label}
                      </div>
                      {!dnf && (
                        <div style={{ height: 4, width: 60, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${score}%`,
                            background: score >= 88 ? '#40b870' : score >= 80 ? '#f0c040' : '#d44020',
                            borderRadius: 2, transition: 'width 0.6s ease',
                          }} />
                        </div>
                      )}
                    </div>
                    {event && (
                      <div className={`sim-event ${eventIsGood(event) ? 'sim-event-pos' : 'sim-event-neg'}`}>
                        {eventIsGood(event) ? '✨' : '⚠️'} {event.label} — {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Final positions */}
      {done && (
        <div style={{
          display: 'flex', gap: 12, marginTop: 20, padding: '16px 20px',
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        }}>
          {[{ car: game.car1, res: result.car1 }, { car: game.car2, res: result.car2 }].map(({ car, res }, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>
                {car?.name}
              </div>
              <PositionBadge position={res.position} dnf={res.dnf} />
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="btn-row" style={{ marginTop: 20 }}>
          <button className="btn btn-primary btn-big" onClick={onDone}>Voir le résultat →</button>
        </div>
      )}

      {!done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          Course en cours…
        </div>
      )}
    </div>
  )
}
