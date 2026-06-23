import { useState } from 'react'

const API = '/api'

const SLOT_COLORS = { P1: '#f5c542', P2: '#3ecf7a', P3: '#5a7cff' }

// Note globale pondérée endurance
function globalRating(p) {
  return Math.round(p.pace * 0.3 + p.night_skill * 0.25 + p.endurance * 0.25 + p.reliability * 0.2)
}
function ratingColor(v) {
  return v >= 88 ? '#1a8f4e' : v >= 83 ? '#1f6fb2' : '#c0392b'
}

function PilotPick({ pilot, onSelect, disabled, daily, budgetLeft }) {
  const [showDetail, setShowDetail] = useState(false)
  const rating = globalRating(pilot)
  const color = ratingColor(rating)
  const cost = pilot.cost || 0
  const tooExpensive = cost > budgetLeft
  const realDisabled = disabled || tooExpensive

  return (
    <div style={{ display: 'flex', flexDirection: 'column', opacity: tooExpensive ? 0.45 : 1 }}>
      <button className="pilot-pick" onClick={() => !realDisabled && onSelect(pilot)} disabled={realDisabled}>
        <div className="rating-badge" style={{ background: daily ? 'rgba(10,26,47,0.06)' : color + '1a', border: daily ? '1px solid rgba(10,26,47,0.15)' : `1px solid ${color}55` }}>
          <span className="rating-num" style={{ color: daily ? '#9bb0c4' : color }}>{daily ? '?' : rating}</span>
        </div>
        <div className="pilot-pick-info">
          <div className="pilot-pick-name">{pilot.nationality} {pilot.name}</div>
          <div className="pilot-pick-profile">{pilot.profile}</div>
        </div>
        {/* Coût pilote */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: tooExpensive ? '#c0392b' : '#e8b53f',
          fontWeight: 700, padding: '0 8px', whiteSpace: 'nowrap',
        }}>
          {cost}M€
        </div>
        {!daily && (
          <span
            onClick={(e) => { e.stopPropagation(); setShowDetail(s => !s) }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6a7d92', padding: '4px 6px', cursor: 'pointer' }}
          >
            {showDetail ? '▲' : 'i'}
          </span>
        )}
      </button>
      {showDetail && !daily && (
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

function TeamCard({ team, onSelect, disabled, daily, budgetLeft }) {
  return (
    <div className="team-card">
      <div className="team-card-head">
        <div className="team-card-meta">#{team.number} · {team.year} · {team.era}</div>
        <div className="team-card-name">{team.car}</div>
        <div className="team-card-sub">{team.constructor}</div>
      </div>
      <div className="team-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {team.pilots.map(p => <PilotPick key={p.id} pilot={p} onSelect={onSelect} disabled={disabled} daily={daily} budgetLeft={budgetLeft} />)}
      </div>
    </div>
  )
}

export default function PilotDrawStep({ slot, pilotIndex, chosenPilotIds, budgetLeft, rerolls, onReroll, onSelect, daily, teamPoolOrder, t }) {
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const stepNum = 5 + pilotIndex
  const slotColor = SLOT_COLORS[`P${(pilotIndex % 3) + 1}`]

  async function fetchTeams() {
    setLoading(true); setTeams(null); setSelected(null)
    const endpoint = daily ? `${API}/daily/teams` : `${API}/draw/teams`
    const payload = daily
      ? { chosen_pilot_ids: chosenPilotIds, team_pool_order: teamPoolOrder, budget_left: budgetLeft }
      : { chosen_pilot_ids: chosenPilotIds, budget_left: budgetLeft }
    try {
      let data = null
      for (let i = 0; i < 4; i++) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error('HTTP ' + res.status)
          data = await res.json()
          if (!data || data.error) throw new Error(data?.error || 'no data')
          break
        } catch (err) {
          if (i === 3) throw err
          await new Promise(r => setTimeout(r, 250 * (i + 1)))
        }
      }
      setTeams(data)
    } catch (e) {
      console.error('team draw failed after retries', e)
    } finally { setLoading(false) }
  }

  function reroll() { if (rerolls <= 0) return; onReroll(); fetchTeams() }
  function confirm() { if (selected) onSelect(selected) }

  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">{t('pilot_eyebrow', { n: stepNum })}</div>
        <div className="step-title">{t('pilot_title')} {pilotIndex + 1}</div>
        <div className="pilot-slot-info">
          <span className="pilot-slot-car" style={{ color: slotColor }}>🏎️ {slot.label.split('—')[0].trim()}</span>
          <span className="pilot-slot-pos">{slot.label.split('—')[1]?.trim()}</span>
        </div>
      </div>

      {!teams && !loading && (
        <div className="draw-area">
          <button className="btn-draw" onClick={fetchTeams}>{t('btn_draw')}</button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>{t('pilot_draw_hint')}</div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-text">{t('drawing')}</div>
        </div>
      )}

      {teams && (
        <>
          <div className="team-cards-row" style={{ marginBottom: 16 }}>
            <TeamCard team={teams.team1} onSelect={setSelected} disabled={selected !== null} daily={daily} budgetLeft={budgetLeft} />
            <TeamCard team={teams.team2} onSelect={setSelected} disabled={selected !== null} daily={daily} budgetLeft={budgetLeft} />
          </div>

          {selected && (
            <div className="selected-banner">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--blue-deep)', marginBottom: 3, fontWeight: 700 }}>{t('pilot_selected')}</div>
                <div style={{ fontWeight: 700, color: 'var(--blue-deep)' }}>{selected.nationality} {selected.name}</div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--blue-deep)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', opacity: 0.8 }}
                onClick={() => setSelected(null)}>{t('pilot_change')}</button>
            </div>
          )}

          <div className="btn-row">
            {!daily && (
              <button className="btn btn-secondary" onClick={reroll} disabled={rerolls <= 0 || selected !== null}>
                🔄 {t('btn_reroll')} ({rerolls})
              </button>
            )}
            <button className="btn btn-primary btn-big" onClick={confirm} disabled={!selected}>
              {t('btn_confirm')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
