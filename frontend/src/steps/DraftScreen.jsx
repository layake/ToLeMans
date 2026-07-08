import { useState, useEffect, useRef } from 'react'

const API = '/api'
const C1 = '#7ad0ff'
const C2 = '#e8b53f'

function ratingColor(v) { return v >= 88 ? '#1a8f4e' : v >= 83 ? '#1f6fb2' : '#c0392b' }
function carRating(c) { return Math.round(c.performance * 0.5 + c.reliability * 0.5) }
function pilotRating(p) { return Math.round(p.pace * 0.3 + p.night_skill * 0.25 + p.endurance * 0.25 + p.reliability * 0.2) }

const SPIN_NAMES = ['Porsche 956', 'Audi R8', 'Ferrari 499P', 'Mazda 787B', 'Peugeot 905', 'Toyota GR010', 'Jaguar XJR-9', 'Sauber C9']

/* ============ DASHBOARD (haut, vivant) ============ */

function GridCenter() {
  const rows = 8
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', flexShrink: 0 }}>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(244,239,227,0.5)', letterSpacing: 2, marginBottom: 3 }}>GRILLE</div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 3 }}>
          {[0, 1].map(c => (
            <div key={c} style={{
              width: 'clamp(14px, 4.1vw, 30px)', height: 'clamp(9px, 2.5vw, 18px)', borderRadius: 2,
              border: '1px solid rgba(244,239,227,0.15)',
              background: (i + c) % 3 === 0 ? 'rgba(244,239,227,0.05)' : 'transparent',
            }} />
          ))}
        </div>
      ))}
      <div style={{ fontSize: 'var(--fs-2xs)', color: 'rgba(244,239,227,0.3)', marginTop: 2 }}>P1–P20</div>
    </div>
  )
}

function CarCol({ label, color, car, pilots, side, active }) {
  const align = side === 'left' ? 'left' : 'right'
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 'var(--fs-xs)', letterSpacing: 2, color, fontWeight: 700, textAlign: align, marginBottom: 'clamp(4px, 1.1vw, 11px)' }}>{label}</div>
      <div style={{
        border: car ? `1px solid ${color}` : `1px dashed ${color}66`,
        borderRadius: 6, padding: 'clamp(5px, 1.4vw, 12px)',
        background: car ? `${color}22` : `${color}0d`,
        marginBottom: 'clamp(4px, 1.1vw, 11px)', textAlign: align,
        boxShadow: active ? `0 0 0 2px ${color}55` : 'none',
        overflow: 'hidden',
      }}>
        {car ? (
          <>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--cream)', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{car.name}</div>
            <div style={{ fontSize: 'var(--fs-2xs)', color: 'rgba(244,239,227,0.6)', marginTop: 2 }}>{car.year} · {carRating(car)}</div>
          </>
        ) : (
          <div style={{ fontSize: 'var(--fs-xs)', color: `${color}88` }}>— — —</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2px, 0.7vw, 7px)' }}>
        {[0, 1, 2].map(i => {
          const p = pilots[i]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: side === 'right' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 'clamp(5px, 1.4vw, 9px)', height: 'clamp(5px, 1.4vw, 9px)', borderRadius: '50%',
                background: p ? color : 'transparent', border: `1px solid ${color}88`, flexShrink: 0,
              }} />
              <div style={{
                fontSize: 'var(--fs-xs)',
                color: p ? 'var(--cream)' : 'rgba(244,239,227,0.4)',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
              }}>
                {p ? p.name : `P${i + 1} · —`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Dashboard({ game, step, t }) {
  const p1 = game.pilots.slice(0, 3)
  const p2 = game.pilots.slice(3, 6)
  return (
    <div style={{ fontFamily: 'var(--font-mono)', marginBottom: 'clamp(10px, 2.9vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-xl)', letterSpacing: 3, color: 'var(--cream)', lineHeight: 1 }}>TO LE MANS</div>
          <div style={{ fontSize: 'var(--fs-2xs)', letterSpacing: 2, color: 'rgba(244,239,227,0.5)', marginTop: 3 }}>
            {game.strategy ? `${{ attaque: '⚡', equilibre: '⚖️', conservation: '🛡️' }[game.strategy]} ${t('strat_' + game.strategy + '_name').toUpperCase()}` : '24H · 1923 — 2025'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--fs-2xs)', color: 'rgba(244,239,227,0.5)', letterSpacing: 2 }}>24 HEURES</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', lineHeight: 1,
            color: 'var(--gold)',
          }}>LE MANS</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(244,239,227,0.12)', marginBottom: 'clamp(8px, 2.3vw, 19px)' }} />

      <div style={{ display: 'flex', gap: 'clamp(8px, 2.3vw, 19px)', alignItems: 'flex-start' }}>
        <CarCol label="V1" color={C1} car={game.car1} pilots={p1} side="left" active={step === 'car1' || (step?.startsWith('pilot') && parseInt(step.slice(5)) < 3)} />
        <GridCenter />
        <CarCol label="V2" color={C2} car={game.car2} pilots={p2} side="right" active={step === 'car2' || (step?.startsWith('pilot') && parseInt(step.slice(5)) >= 3)} />
      </div>

      {/* DT */}
      <div style={{
        marginTop: 'clamp(8px, 2.3vw, 16px)',
        border: game.director ? '1px solid rgba(244,239,227,0.4)' : '1px dashed rgba(244,239,227,0.25)',
        borderRadius: 6, padding: 'clamp(5px, 1.6vw, 12px) clamp(8px, 2.3vw, 16px)',
        background: game.director ? 'rgba(244,239,227,0.07)' : 'transparent',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: step === 'director' ? '0 0 0 2px rgba(244,239,227,0.3)' : 'none',
      }}>
        <span style={{ fontSize: 'var(--fs-2xs)', letterSpacing: 2, color: 'rgba(244,239,227,0.5)' }}>D.T.</span>
        <span style={{ fontSize: 'var(--fs-sm)', color: game.director ? 'var(--cream)' : 'rgba(244,239,227,0.35)', fontWeight: 700 }}>
          {game.director ? game.director.name : '— — —'}
        </span>
      </div>
    </div>
  )
}

/* ============ ZONE D'ACTION (bas) ============ */

export function ActionShell({ title, children }) {
  return (
    <div style={{
      background: 'rgba(8,32,61,0.75)', border: '1px solid rgba(244,239,227,0.12)',
      borderRadius: 12, padding: 'clamp(12px, 3.4vw, 24px)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: 'var(--fs-xs)', letterSpacing: 3, color: 'var(--blue-sky, #4ea3d9)', marginBottom: 'clamp(8px, 2.3vw, 19px)', textTransform: 'uppercase', color: '#7ad0ff' }}>{title}</div>
      {children}
    </div>
  )
}

function StrategyAction({ onPick, t }) {
  const S = [
    { id: 'attaque', icon: '⚡', risk: t('tag_casse') },
    { id: 'equilibre', icon: '⚖️', risk: t('tag_polyvalent') },
    { id: 'conservation', icon: '🛡️', risk: t('tag_fiab_max') },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {S.map(s => (
        <button key={s.id} onClick={() => onPick(s.id)} style={{
          border: '1px solid rgba(244,239,227,0.25)', borderRadius: 8,
          padding: 'clamp(10px, 2.9vw, 22px) 6px', background: 'transparent', cursor: 'pointer',
          color: 'var(--cream)', fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
        }}>
          <div style={{ fontSize: 'var(--fs-lg)' }}>{s.icon}</div>
          <div style={{ fontSize: 'var(--fs-xs)', letterSpacing: 1, marginTop: 5 }}>{t('strat_' + s.id + '_name').toUpperCase()}</div>
          <div style={{ fontSize: 'var(--fs-2xs)', color: 'rgba(244,239,227,0.5)', marginTop: 3 }}>{s.risk}</div>
        </button>
      ))}
    </div>
  )
}

function CarAction({ carNum, excludeIds, rerolls, onReroll, onPick, t }) {
  const [options, setOptions] = useState(null)
  const [spin, setSpin] = useState(false)
  const [spinName, setSpinName] = useState('')
  const spinRef = useRef(null)

  async function fetchOpts(tries = 8) {
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(`${API}/draw/car`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exclude: excludeIds }),
        })
        if (!r.ok) throw new Error()
        const d = await r.json()
        if (!d?.options) throw new Error()
        return d.options
      } catch { await new Promise(res => setTimeout(res, 300)) }
    }
    return null
  }

  async function draw() {
    setSpin(true); setOptions(null)
    let stop = false
    const loop = () => { if (stop) return; setSpinName(SPIN_NAMES[Math.floor(Math.random() * SPIN_NAMES.length)]); spinRef.current = setTimeout(loop, 90) }
    loop()
    const minT = Date.now() + 1200
    const opts = await fetchOpts()
    setTimeout(() => { stop = true; clearTimeout(spinRef.current); setSpin(false); if (opts) setOptions(opts) }, Math.max(0, minT - Date.now()))
  }

  if (spin) return <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', color: 'rgba(244,239,227,0.7)' }}>{spinName}</div>

  if (!options) return (
    <div style={{ textAlign: 'center' }}>
      <button className="btn btn-primary btn-big" onClick={draw}>{t('btn_draw')}</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((c, i) => {
        const r = carRating(c)
        return (
          <button key={c.id + i} onClick={() => onPick(c)} style={{
            background: 'var(--cream)', color: 'var(--ink)', border: 'none', borderRadius: 8,
            padding: 'clamp(10px, 2.9vw, 19px)', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)',
              color: ratingColor(r), minWidth: 34, textAlign: 'center',
            }}>{r}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: '#6a7d92', marginTop: 2 }}>{c.year} · {c.era} · P{c.performance} F{c.reliability}</div>
            </div>
          </button>
        )
      })}
      <button className="btn btn-secondary" onClick={() => { if (rerolls > 0) { onReroll(); draw() } }} disabled={rerolls <= 0} style={{ alignSelf: 'center' }}>
        🔄 {t('btn_reroll')} ({rerolls})
      </button>
    </div>
  )
}

function DirectorAction({ onPick, t }) {
  const [directors, setDirectors] = useState([])
  useEffect(() => { fetch(`${API}/directors`).then(r => r.json()).then(setDirectors).catch(console.error) }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '42vh', overflowY: 'auto' }}>
      {directors.map(dt => {
        return (
          <button key={dt.id} onClick={() => onPick(dt)} style={{
            background: 'var(--cream)', color: 'var(--ink)', border: 'none', borderRadius: 8,
            padding: 'clamp(8px, 2.3vw, 16px)', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)' }}>{dt.name}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: '#1f6fb2', marginTop: 2 }}>
                {({ all: '🏆', night: '🌙', rain: '🌧️', pace: '⚡', strategy: '🧠' }[dt.bonus_condition] || '')} {t('cond_' + dt.bonus_condition)} · +{dt.reliability_bonus} fiab
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PilotsAction({ chosenPilotIds, rerolls, onReroll, onPick, daily, teamPoolOrder, t }) {
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchTeams() {
    setLoading(true)
    const payload = daily
      ? { chosen_pilot_ids: chosenPilotIds, team_pool_order: teamPoolOrder }
      : { chosen_pilot_ids: chosenPilotIds }
    const url = daily ? `${API}/daily/teams` : `${API}/draw/teams`
    for (let i = 0; i < 8; i++) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!r.ok) throw new Error()
        const d = await r.json()
        if (d?.team1) { setTeams(d); setLoading(false); return }
        throw new Error()
      } catch { await new Promise(res => setTimeout(res, 300)) }
    }
    setLoading(false)
  }

  useEffect(() => { fetchTeams() }, [chosenPilotIds.length])

  if (loading) return <div style={{ textAlign: 'center', padding: 20, color: 'rgba(244,239,227,0.6)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>…</div>
  if (!teams) return <div style={{ textAlign: 'center', padding: 20, color: '#ff8a7a', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Erreur réseau</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[teams.team1, teams.team2].map(team => (
        <div key={team.id} style={{
          background: 'var(--cream)', color: 'var(--ink)', borderRadius: 8,
          padding: 'clamp(8px, 2.3vw, 16px)', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ fontSize: 'var(--fs-xs)', color: '#6a7d92', marginBottom: 6 }}>#{team.number} · {team.year} · {team.car}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {team.pilots.map(p => {
              const r = pilotRating(p)
              return (
                <button key={p.id} onClick={() => onPick(p)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  background: 'rgba(10,26,47,0.05)', border: '1px solid rgba(10,26,47,0.1)',
                  borderRadius: 6, padding: 'clamp(6px, 1.7vw, 12px)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-md)', color: daily ? '#9bb0c4' : ratingColor(r), minWidth: 26 }}>{daily ? '?' : r}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.nationality} {p.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!daily && (
        <button className="btn btn-secondary" onClick={() => { if (rerolls > 0) { onReroll(); fetchTeams() } }} disabled={rerolls <= 0} style={{ alignSelf: 'center' }}>
          🔄 {t('btn_reroll')} ({rerolls})
        </button>
      )}
    </div>
  )
}

function LaunchAction({ game, onLaunch, t }) {
  const [loading, setLoading] = useState(false)

  async function launch() {
    setLoading(true)
    try {
      const posRes = await fetch(`${API}/start-positions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const positions = await posRes.json()
      const res = await fetch(`${API}/simulate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: game.strategy, car1: game.car1, car2: game.car2, director: game.director,
          pilots_car1: game.pilots.slice(0, 3), pilots_car2: game.pilots.slice(3, 6),
          start_position_car1: positions.car1, start_position_car2: positions.car2,
        }),
      })
      const data = await res.json()
      data.start_position_car1 = positions.car1
      data.start_position_car2 = positions.car2
      onLaunch(data)
    } catch (e) { console.error(e); setLoading(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 16 }}><div className="spinner" /><div className="loading-text">{t('review_launching')}</div></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button className="btn btn-primary btn-big" onClick={launch} style={{ width: '100%' }}>
        {t('review_launch')}
      </button>
    </div>
  )
}

/* ============ ÉCRAN UNIQUE ============ */

export default function DraftScreen({ game, setGame, config, daily, dailyData, rerolls, onReroll, onLaunch, t }) {
  const steps = daily
    ? ['strategy', 'director', 'pilot0', 'pilot1', 'pilot2', 'pilot3', 'pilot4', 'pilot5', 'launch']
    : ['strategy', 'car1', 'car2', 'director', 'pilot0', 'pilot1', 'pilot2', 'pilot3', 'pilot4', 'pilot5', 'launch']
  const [step, setStep] = useState(steps[0])
  const next = () => setStep(s => steps[Math.min(steps.indexOf(s) + 1, steps.length - 1)])

  const pick = {
    strategy: s => { setGame(g => ({ ...g, strategy: s })); next() },
    car: c => {
      setGame(g => step === 'car1'
        ? { ...g, car1: c }
        : { ...g, car2: c })
      next()
    },
    director: d => { setGame(g => ({ ...g, director: d })); next() },
    pilot: p => {
      setGame(g => ({ ...g, pilots: [...g.pilots, p], chosenPilotIds: [...g.chosenPilotIds, p.id] }))
      next()
    },
  }

  const pilotIdx = step.startsWith('pilot') ? parseInt(step.slice(5)) : -1
  const carLabel = pilotIdx >= 0 ? (pilotIdx < 3 ? 'V1' : 'V2') : ''
  const slotNum = pilotIdx >= 0 ? (pilotIdx % 3) + 1 : 0

  const titles = {
    strategy: t('strat_title'),
    car1: `${t('car_title')} 1`,
    car2: `${t('car_title')} 2`,
    director: t('dir_title'),
    launch: t('review_title'),
  }
  const title = step.startsWith('pilot') ? `${carLabel} · ${t('pilot_title') || 'PILOTE'} ${slotNum}` : titles[step]

  return (
    <div className="screen-enter draft-layout">
      <div className="draft-dash">
        <Dashboard game={game} step={step} t={t} />
      </div>

      <div className="draft-action">
      <ActionShell title={title}>
        {step === 'strategy' && <StrategyAction onPick={pick.strategy} t={t} />}
        {(step === 'car1' || step === 'car2') && (
          <CarAction key={step} carNum={step === 'car1' ? 1 : 2}
            excludeIds={[game.car1?.id, game.car2?.id].filter(Boolean)}
            rerolls={rerolls} onReroll={onReroll} onPick={pick.car} t={t} />
        )}
        {step === 'director' && <DirectorAction onPick={pick.director} t={t} />}
        {step.startsWith('pilot') && (
          <PilotsAction key={step} chosenPilotIds={game.chosenPilotIds}
            rerolls={rerolls} onReroll={onReroll} onPick={pick.pilot}
            daily={daily} teamPoolOrder={dailyData?.team_pool_order} t={t} />
        )}
        {step === 'launch' && <LaunchAction game={game} onLaunch={onLaunch} t={t} />}
      </ActionShell>
      </div>
    </div>
  )
}
