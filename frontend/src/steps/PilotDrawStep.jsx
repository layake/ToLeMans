import { useState } from 'react'

const API = '/api'

function PilotButton({ pilot, onSelect, disabled }) {
  return (
    <button
      onClick={() => !disabled && onSelect(pilot)}
      disabled={disabled}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--yellow)'; e.currentTarget.style.background = 'rgba(240,192,64,0.06)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{pilot.nationality} {pilot.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{pilot.profile}</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[['PACE', pilot.pace], ['NUIT', pilot.night_skill], ['ENDU', pilot.endurance], ['FIAB', pilot.reliability]].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: val >= 88 ? 'var(--green)' : val >= 83 ? 'var(--yellow)' : 'var(--text-dim)' }}>{val}</span>
          </div>
        ))}
      </div>
    </button>
  )
}

function TeamCard({ team, onSelect, disabled }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 16px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 4 }}>
          #{team.number} · {team.year} · {team.era}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 0.5, color: 'var(--text)', lineHeight: 1.2 }}>
          {team.car}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{team.constructor}</div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {team.pilots.map(pilot => (
          <PilotButton key={pilot.id} pilot={pilot} onSelect={onSelect} disabled={disabled} />
        ))}
      </div>
    </div>
  )
}

export default function PilotDrawStep({ slot, pilotIndex, chosenPilotIds, rerolls, onReroll, onSelect }) {
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const stepNum = 5 + pilotIndex

  async function fetchTeams(excludeIds) {
    setLoading(true)
    setTeams(null)
    setSelected(null)
    try {
      const res = await fetch(`${API}/draw/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosen_pilot_ids: excludeIds }),
      })
      const data = await res.json()
      if (data.error) {
        console.error(data.error)
        return
      }
      setTeams(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function draw() {
    fetchTeams(chosenPilotIds)
  }

  function reroll() {
    if (rerolls <= 0) return
    onReroll()
    fetchTeams(chosenPilotIds)
  }

  function pickPilot(pilot) {
    setSelected(pilot)
  }

  function confirm() {
    if (selected) onSelect(selected)
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
          Deux écuries sont proposées. Choisissez un pilote parmi les six.
          Les écuries avec un pilote déjà choisi ne peuvent plus apparaître.
        </div>
      </div>

      {!teams && !loading && (
        <div className="draw-area">
          <button className="btn-draw" onClick={draw}>TIRER</button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-text">TIRAGE EN COURS…</div>
        </div>
      )}

      {teams && (
        <>
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <TeamCard
              team={teams.team1}
              onSelect={pickPilot}
              disabled={selected !== null}
            />
            <TeamCard
              team={teams.team2}
              onSelect={pickPilot}
              disabled={selected !== null}
            />
          </div>

          {selected && (
            <div style={{
              background: 'rgba(240,192,64,0.08)',
              border: '1px solid var(--yellow)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yellow)', marginBottom: 4 }}>PILOTE SÉLECTIONNÉ</div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{selected.nationality} {selected.name}</div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
                onClick={() => setSelected(null)}
              >
                Changer
              </button>
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-secondary"
              onClick={reroll}
              disabled={rerolls <= 0 || selected !== null}
            >
              🔄 Reroll ({rerolls})
            </button>
            <button
              className="btn btn-primary btn-big"
              onClick={confirm}
              disabled={!selected}
            >
              Confirmer →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
