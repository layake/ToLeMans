import { useState } from 'react'

const API = '/api'

const PHASES = [
  { id: 'depart', label: 'Départ', hours: '16h', icon: '🚦' },
  { id: 'nuit', label: 'Nuit', hours: '20h', icon: '🌙' },
  { id: 'nuit_profonde', label: 'Nuit Profonde', hours: '00h', icon: '🌑' },
  { id: 'aube', label: 'Aube', hours: '4h', icon: '🌅' },
  { id: 'sprint', label: 'Sprint', hours: '8h', icon: '⚡' },
]

const PHASE_DOMINANT = {
  attaque:      { depart: 'P1', nuit: 'P3', nuit_profonde: 'P2', aube: 'P1', sprint: 'P3' },
  conservation: { depart: 'P1', nuit: 'P2', nuit_profonde: 'P3', aube: 'P1', sprint: 'P2' },
  equilibre:    { depart: 'P1', nuit: 'P2', nuit_profonde: 'P1', aube: 'P2', sprint: 'P1' },
}

const SLOT_COLORS = { P1: '#f0c040', P2: '#40b870', P3: '#6080ff' }

function StatBar({ label, value }) {
  const color = value >= 88 ? '#40b870' : value >= 83 ? '#f0c040' : '#d44020'
  const segments = 10
  const filled = Math.round((value / 100) * segments)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', width: 32, letterSpacing: 1 }}>{label}</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} style={{
            width: 7, height: 12, borderRadius: 2,
            background: i < filled ? color : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, fontWeight: 700, width: 20 }}>{value}</span>
    </div>
  )
}

function PilotButton({ pilot, onSelect, disabled }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={() => !disabled && onSelect(pilot)}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && !disabled ? 'rgba(240,192,64,0.08)' : 'var(--surface)',
        border: `1px solid ${hover && !disabled ? 'var(--yellow)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{pilot.nationality} {pilot.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>{pilot.profile}</span>
      </div>
      <StatBar label="PACE" value={pilot.pace} />
      <StatBar label="NUIT" value={pilot.night_skill} />
      <StatBar label="ENDU" value={pilot.endurance} />
      <StatBar label="FIAB" value={pilot.reliability} />
    </button>
  )
}

function TeamCard({ team, onSelect, disabled }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '16px 14px',
      flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 3 }}>
          #{team.number} · {team.year} · {team.era}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text)', lineHeight: 1.2 }}>{team.car}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{team.constructor}</div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {team.pilots.map(pilot => (
          <PilotButton key={pilot.id} pilot={pilot} onSelect={onSelect} disabled={disabled} />
        ))}
      </div>
    </div>
  )
}

function RotationGrid({ strategy, pilots, currentIndex }) {
  if (!strategy) return null
  const dominant = PHASE_DOMINANT[strategy]
  const car1Pilots = pilots.slice(0, 3)
  const car2Pilots = pilots.slice(3, 6)

  function getPilotForSlot(carPilots, slotStr) {
    const idx = parseInt(slotStr.replace('P', '')) - 1
    return carPilots[idx] || null
  }

  return (
    <div style={{
      marginTop: 24, background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '16px 20px',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 12 }}>
        ROTATION DES PILOTES
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${PHASES.length}, 1fr)`, gap: 4 }}>
        <div />
        {PHASES.map(ph => (
          <div key={ph.id} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>{ph.icon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{ph.hours}</div>
          </div>
        ))}
        {[{ label: 'VOITURE 1', pilots: car1Pilots }, { label: 'VOITURE 2', pilots: car2Pilots }].map(({ label, pilots: carPilots }) => (
          <>
            <div key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {label}
            </div>
            {PHASES.map(ph => {
              const slot = dominant[ph.id]
              const pilot = getPilotForSlot(carPilots, slot)
              const color = SLOT_COLORS[slot]
              return (
                <div key={ph.id} style={{
                  background: color + '20',
                  border: `1px solid ${color}40`,
                  borderRadius: 4, padding: '4px 2px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color, fontWeight: 700 }}>{slot}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pilot ? pilot.name.split(' ').pop() : '—'}
                  </div>
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

export default function PilotDrawStep({ slot, pilotIndex, chosenPilotIds, strategy, currentPilots, rerolls, onReroll, onSelect }) {
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const stepNum = 5 + pilotIndex

  async function fetchTeams() {
    setLoading(true)
    setTeams(null)
    setSelected(null)
    try {
      const res = await fetch(`${API}/draw/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosen_pilot_ids: chosenPilotIds }),
      })
      const data = await res.json()
      if (data.error) { console.error(data.error); return }
      setTeams(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function reroll() {
    if (rerolls <= 0) return
    onReroll()
    fetchTeams()
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
          <span className="pilot-slot-car" style={{ color: SLOT_COLORS[`P${(pilotIndex % 3) + 1}`] }}>
            🏎️ {slot.label.split('—')[0].trim()}
          </span>
          <span className="pilot-slot-pos">{slot.label.split('—')[1]?.trim()}</span>
        </div>
        <div className="step-desc">
          Deux écuries sont proposées. Choisissez un pilote parmi les six.
        </div>
      </div>

      {!teams && !loading && (
        <div className="draw-area">
          <button className="btn-draw" onClick={fetchTeams}>TIRER</button>
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
          <div className="team-cards-row" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <TeamCard team={teams.team1} onSelect={setSelected} disabled={selected !== null} />
            <TeamCard team={teams.team2} onSelect={setSelected} disabled={selected !== null} />
          </div>

          {selected && (
            <div style={{
              background: 'rgba(240,192,64,0.08)', border: '1px solid var(--yellow)',
              borderRadius: 'var(--radius)', padding: '12px 18px', marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
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

      <RotationGrid strategy={strategy} pilots={currentPilots} currentIndex={pilotIndex} />
    </div>
  )
}
