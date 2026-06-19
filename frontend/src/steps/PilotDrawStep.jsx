import { useState } from 'react'

const API = '/api'

const SLOT_COLORS = { P1: '#f5c542', P2: '#3ecf7a', P3: '#5a7cff' }

// Note globale pondérée endurance
function globalRating(p) {
  return Math.round(p.pace * 0.3 + p.night_skill * 0.25 + p.endurance * 0.25 + p.reliability * 0.2)
}
function ratingColor(v) {
  return v >= 88 ? '#3ecf7a' : v >= 83 ? '#f5c542' : '#e0533a'
}

function PilotPick({ pilot, onSelect, disabled }) {
  const [showDetail, setShowDetail] = useState(false)
  const rating = globalRating(pilot)
  const color = ratingColor(rating)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button className="pilot-pick" onClick={() => !disabled && onSelect(pilot)} disabled={disabled}>
        <div className="rating-badge" style={{ background: color + '1a', border: `1px solid ${color}55` }}>
          <span className="rating-num" style={{ color }}>{rating}</span>
        </div>
        <div className="pilot-pick-info">
          <div className="pilot-pick-name">{pilot.nationality} {pilot.name}</div>
          <div className="pilot-pick-profile">{pilot.profile}</div>
        </div>
        <span
          onClick={(e) => { e.stopPropagation(); setShowDetail(s => !s) }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', padding: '4px 6px', cursor: 'pointer' }}
        >
          {showDetail ? '▲' : 'i'}
        </span>
      </button>
      {showDetail && (
        <div className="detail-stats">
          {[['PACE', pilot.pace], ['NUIT', pilot.night_skill], ['ENDU', pilot.endurance], ['FIAB', pilot.reliability]].map(([lbl, val]) => (
            <div key={lbl} className="detail-stat">
              <div className="detail-stat-lbl">{lbl}</div>
              <div className="detail-stat-bar"><div className="detail-stat-fill" style={{ width: `${val}%`, background: ratingColor(val) }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, onSelect, disabled }) {
  return (
    <div className="team-card">
      <div className="team-card-head">
        <div className="team-card-meta">#{team.number} · {team.year} · {team.era}</div>
        <div className="team-card-name">{team.car}</div>
        <div className="team-card-sub">{team.constructor}</div>
      </div>
      <div className="team-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {team.pilots.map(p => <PilotPick key={p.id} pilot={p} onSelect={onSelect} disabled={disabled} />)}
      </div>
    </div>
  )
}

export default function PilotDrawStep({ slot, pilotIndex, chosenPilotIds, rerolls, onReroll, onSelect }) {
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const stepNum = 5 + pilotIndex
  const slotColor = SLOT_COLORS[`P${(pilotIndex % 3) + 1}`]

  async function fetchTeams() {
    setLoading(true); setTeams(null); setSelected(null)
    try {
      const res = await fetch(`${API}/draw/teams`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosen_pilot_ids: chosenPilotIds }),
      })
      const data = await res.json()
      if (data.error) { console.error(data.error); return }
      setTeams(data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  function reroll() { if (rerolls <= 0) return; onReroll(); fetchTeams() }
  function confirm() { if (selected) onSelect(selected) }

  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">Étape {stepNum} / 11 · Équipage</div>
        <div className="step-title">Pilote {pilotIndex + 1}</div>
        <div className="pilot-slot-info">
          <span className="pilot-slot-car" style={{ color: slotColor }}>🏎️ {slot.label.split('—')[0].trim()}</span>
          <span className="pilot-slot-pos">{slot.label.split('—')[1]?.trim()}</span>
        </div>
      </div>

      {!teams && !loading && (
        <div className="draw-area">
          <button className="btn-draw" onClick={fetchTeams}>TIRER</button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
            Deux écuries vont apparaître. Choisis un pilote parmi les six.
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-text">TIRAGE…</div>
        </div>
      )}

      {teams && (
        <>
          <div className="team-cards-row" style={{ marginBottom: 16 }}>
            <TeamCard team={teams.team1} onSelect={setSelected} disabled={selected !== null} />
            <TeamCard team={teams.team2} onSelect={setSelected} disabled={selected !== null} />
          </div>

          {selected && (
            <div className="selected-banner">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)', marginBottom: 3 }}>PILOTE SÉLECTIONNÉ</div>
                <div style={{ fontWeight: 700 }}>{selected.nationality} {selected.name}</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
                onClick={() => setSelected(null)}>Changer</button>
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-secondary" onClick={reroll} disabled={rerolls <= 0 || selected !== null}>
              🔄 Reroll ({rerolls})
            </button>
            <button className="btn btn-primary btn-big" onClick={confirm} disabled={!selected}>
              Confirmer →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
