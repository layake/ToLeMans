import { useState, useEffect, useRef } from 'react'

const PHASES = [
  { id: 'depart',        label: 'Départ',       hours: '16h → 20h', icon: '🚦', color: '#f0c040' },
  { id: 'nuit',          label: 'Nuit',          hours: '20h → 00h', icon: '🌙', color: '#6080ff' },
  { id: 'nuit_profonde', label: 'Nuit Profonde', hours: '00h → 04h', icon: '🌑', color: '#4040a0' },
  { id: 'aube',          label: 'Aube',          hours: '04h → 08h', icon: '🌅', color: '#ff8040' },
  { id: 'sprint',        label: 'Sprint Final',  hours: '08h → 16h', icon: '⚡', color: '#40b870' },
]

const TOTAL_RACE_MS = 7000 // durée totale de l'animation = 5 phases × 1.4s

function pad(n) { return String(n).padStart(2, '0') }

function raceTimeFromProgress(pct) {
  // 0% = 16:00, 100% = 16:00 (lendemain) = +24h
  const totalMinutes = pct * 24 * 60
  const rawHour = 16 + totalMinutes / 60
  const h = Math.floor(rawHour) % 24
  const m = Math.floor(totalMinutes % 60)
  return { h, m, str: `${pad(h)}:${pad(m)}` }
}

function AnalogClock({ progress }) {
  const { h, m, str } = raceTimeFromProgress(progress / 100)
  const size = 110
  const cx = size / 2
  const cy = size / 2
  const r = 46

  // Minute hand: full rotation every 60 min
  const minuteAngle = (m / 60) * 360 - 90
  const mRad = (minuteAngle * Math.PI) / 180
  const mLen = r * 0.82
  const mx = cx + Math.cos(mRad) * mLen
  const my = cy + Math.sin(mRad) * mLen

  // Hour hand: full rotation every 12h
  const hourFrac = ((h % 12) + m / 60) / 12
  const hourAngle = hourFrac * 360 - 90
  const hRad = (hourAngle * Math.PI) / 180
  const hLen = r * 0.55
  const hx = cx + Math.cos(hRad) * hLen
  const hy = cy + Math.sin(hRad) * hLen

  // Day/night background
  const isNight = h >= 20 || h < 6
  const isDawn = h >= 6 && h < 8
  const bgColor = isNight ? '#0a0a20' : isDawn ? '#1a1030' : '#0c0c18'
  const rimColor = isNight ? '#6080ff' : isDawn ? '#ff8040' : '#f0c040'

  // Hour markers
  const markers = Array.from({ length: 24 }, (_, i) => {
    const angle = ((i / 24) * 360 - 90) * Math.PI / 180
    const inner = r * (i % 6 === 0 ? 0.78 : 0.87)
    const outer = r * 0.95
    return {
      x1: cx + Math.cos(angle) * inner,
      y1: cy + Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * outer,
      y2: cy + Math.sin(angle) * outer,
      bold: i % 6 === 0,
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Face */}
        <circle cx={cx} cy={cy} r={r} fill={bgColor} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={rimColor} strokeWidth={2.5} />

        {/* Hour markers */}
        {markers.map((mk, i) => (
          <line key={i} x1={mk.x1} y1={mk.y1} x2={mk.x2} y2={mk.y2}
            stroke={rimColor} strokeWidth={mk.bold ? 2 : 0.8} strokeOpacity={mk.bold ? 1 : 0.4} />
        ))}

        {/* Progress arc */}
        {(() => {
          const arcR = r * 0.88
          const angle = (progress / 100) * 360
          const startRad = -90 * Math.PI / 180
          const endRad = (angle - 90) * Math.PI / 180
          const laf = angle > 180 ? 1 : 0
          const ex = cx + Math.cos(endRad) * arcR
          const ey = cy + Math.sin(endRad) * arcR
          const sx = cx + Math.cos(startRad) * arcR
          const sy = cy + Math.sin(startRad) * arcR
          if (progress <= 0) return null
          return (
            <path
              d={`M ${sx} ${sy} A ${arcR} ${arcR} 0 ${laf} 1 ${ex} ${ey}`}
              fill="none" stroke={rimColor} strokeWidth={3} strokeOpacity={0.35}
              strokeLinecap="round"
            />
          )
        })()}

        {/* Hour hand */}
        <line x1={cx} y1={cy} x2={hx} y2={hy}
          stroke="#e8e8f4" strokeWidth={3} strokeLinecap="round" />

        {/* Minute hand */}
        <line x1={cx} y1={cy} x2={mx} y2={my}
          stroke={rimColor} strokeWidth={2} strokeLinecap="round" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={rimColor} />

        {/* Time text */}
        <text x={cx} y={cy + r * 0.45} textAnchor="middle"
          fontFamily="JetBrains Mono, monospace" fontSize="10"
          fill="#e8e8f4" fontWeight="600">{str}</text>
      </svg>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>
        {isNight ? '🌙 NUIT' : isDawn ? '🌅 AUBE' : '☀️ JOUR'}
      </div>
    </div>
  )
}

function scoreClass(score, dnf) {
  if (dnf) return 'dnf'
  if (score >= 90) return 'dominant'
  if (score >= 84) return 'solid'
  if (score >= 76) return 'ok'
  return 'bad'
}

// Petit générateur pseudo-aléatoire gaussien
function gauss(mean, sd) {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const RIVAL_POOL = [
  { num: '7',  constructor: 'Toyota',   color: '#e0533a' },
  { num: '51', constructor: 'Ferrari',  color: '#d32f2f' },
  { num: '6',  constructor: 'Porsche',  color: '#cfae5e' },
  { num: '2',  constructor: 'Cadillac', color: '#c0c0c0' },
  { num: '15', constructor: 'BMW',      color: '#4a90d9' },
  { num: '93', constructor: 'Peugeot',  color: '#6a8f3c' },
  { num: '35', constructor: 'Alpine',   color: '#3f7fc4' },
  { num: '8',  constructor: 'Toyota',   color: '#b03030' },
  { num: '12', constructor: 'Cadillac', color: '#9aa0a6' },
  { num: '5',  constructor: 'Porsche',  color: '#d8b25e' },
]

// Construit le peloton : 2 voitures du joueur (scores réels) + rivales fictives calibrées
function buildField(result, game) {
  const phases = result.phase_summaries || []
  const n = phases.length

  // Voitures joueur — scores réels par phase
  function playerCar(idx, name, color) {
    const scores = []
    let dnfFrom = null
    phases.forEach((ph, i) => {
      const dnf = idx === 1 ? ph.car1_dnf : ph.car2_dnf
      const sc = idx === 1 ? ph.car1_score : ph.car2_score
      if (dnf && dnfFrom === null) dnfFrom = i
      scores.push(dnfFrom !== null ? 0 : (sc ?? 0))
    })
    return { id: 'p' + idx, name, num: idx === 1 ? '①' : '②', color, isPlayer: true, scores, dnfFrom }
  }

  const c1 = playerCar(1, game.car1?.name || 'Voiture 1', '#f5c542')
  const c2 = playerCar(2, game.car2?.name || 'Voiture 2', '#4ea3d9')

  // Moyenne de la meilleure voiture joueur (hors phases DNF)
  const avg = (c) => {
    const valid = c.scores.filter((_, i) => c.dnfFrom === null || i < c.dnfFrom)
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  }
  const bestAvg = Math.max(avg(c1), avg(c2))

  // Combien de rivales doivent finir AU-DESSUS du joueur, selon sa vraie position
  const bestPos = result.best_position || 50
  const nRivals = 8
  const nAbove = Math.max(0, Math.min(nRivals, bestPos - 1))

  const pool = [...RIVAL_POOL].sort(() => Math.random() - 0.5).slice(0, nRivals)
  const rivals = pool.map((r, i) => {
    const target = i < nAbove
      ? bestAvg + (1 + Math.random() * 6)
      : bestAvg - (1 + Math.random() * 9)
    const scores = phases.map(() => Math.max(40, Math.min(99, gauss(target, 3.5))))
    return { id: 'r' + i, name: `#${r.num} ${r.constructor}`, num: r.num, color: r.color, isPlayer: false, scores, dnfFrom: null }
  })

  return [c1, c2, ...rivals]
}

// Classement cumulé jusqu'à la phase visible
function rankField(field, visibleCount) {
  const withCum = field.map(car => {
    let cum = 0
    let dnf = false
    for (let i = 0; i < visibleCount; i++) {
      if (car.dnfFrom !== null && i >= car.dnfFrom) { dnf = true; break }
      cum += car.scores[i] || 0
    }
    return { ...car, cum: dnf ? -1 : cum, dnf }
  })
  // tri : DNF en bas, sinon par cumul décroissant
  withCum.sort((a, b) => b.cum - a.cum)
  return withCum
}

function LiveLeaderboard({ field, visibleCount, t }) {
  const ranked = rankField(field, Math.max(1, visibleCount))
  const rowH = 42
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#bcdcf2', letterSpacing: 2, marginBottom: 10 }}>
        {t('sim_leaderboard')}
      </div>
      <div style={{ position: 'relative', height: ranked.length * rowH }}>
        {ranked.map((car, rank) => (
          <div key={car.id} style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: rowH - 6,
            transform: `translateY(${rank * rowH}px)`,
            willChange: 'transform',
            zIndex: car.isPlayer ? 20 : ranked.length - rank,
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
            borderRadius: 'var(--radius)',
            background: car.isPlayer ? 'var(--cream)' : 'var(--card)',
            border: car.isPlayer ? '1px solid var(--blue-sky)' : '1px solid var(--border)',
            boxShadow: car.isPlayer ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
            transition: 'transform 0.65s cubic-bezier(0.4,0.0,0.2,1)',
            opacity: car.dnf ? 0.5 : 1,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 18, minWidth: 26, textAlign: 'center',
              color: car.dnf ? '#e0533a' : car.isPlayer ? 'var(--blue-deep)' : 'var(--text-muted)',
            }}>
              {car.dnf ? '—' : rank + 1}
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: car.color, flexShrink: 0 }} />
            <div style={{
              flex: 1, fontSize: 13, fontWeight: car.isPlayer ? 700 : 500,
              color: car.isPlayer ? 'var(--blue-deep)' : 'var(--text-dim)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {car.isPlayer && <span style={{ marginRight: 6 }}>{car.num}</span>}
              {car.name}
            </div>
            {car.dnf
              ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#e0533a' }}>{t('abandon_caps')}</span>
              : car.isPlayer && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--blue-mid)' }}>{t('sim_you')}</span>
            }
          </div>
        ))}
      </div>
    </div>
  )
}

function PositionBadge({ position, dnf }) {
  if (dnf) return <span style={{ color: '#e0533a', fontFamily: 'var(--font-display)', fontSize: 20 }}>DNF</span>
  if (!position) return null
  const color = position === 1 ? '#f0c040' : position <= 3 ? '#40b870' : 'var(--text-dim)'
  return <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color, letterSpacing: 1 }}>P{position}</span>
}

export default function SimulationStep({ result, game, onDone, t }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)
  const fieldRef = useRef(null)
  if (fieldRef.current === null) fieldRef.current = buildField(result, game)

  const phases = result.phase_summaries || []
  const totalPhases = phases.length

  useEffect(() => {
    // Garde la page en haut au lancement de la course
    window.scrollTo({ top: 0, behavior: 'auto' })
    const sc = document.querySelector('.app-body'); if (sc) sc.scrollTop = 0
    // Smooth analog clock animation
    startRef.current = performance.now()
    const animate = (now) => {
      const elapsed = now - startRef.current
      const pct = Math.min(100, (elapsed / TOTAL_RACE_MS) * 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    // Phase reveals (independent)
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setVisibleCount(idx)
      if (idx >= totalPhases) {
        clearInterval(interval)
        setTimeout(() => setDone(true), 700)
      }
    }, 1400)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearInterval(interval)
    }
  }, [totalPhases])

  return (
    <div>
      <div className="step-header" style={{ marginBottom: 16 }}>
        <div className="step-eyebrow">{t('sim_eyebrow')}</div>
        <div className="step-title">{t('sim_title')}</div>
        <div className="step-desc" style={{ marginBottom: 0 }}>{game.director?.name} {t('sim_at_pitwall')}</div>
      </div>

      {/* Horloge analogique + infos course */}
      <div style={{
        display: "flex", alignItems: "center", gap: 28,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24,
      }}>
        <AnalogClock progress={progress} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4ea3d9', letterSpacing: 2, marginBottom: 10 }}>
            {t('sim_progress')}
          </div>
          {/* Linear bar */}
          <div style={{ position: 'relative', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f0c040, #6080ff, #40b870)',
              borderRadius: 4,
            }} />
          </div>
          {/* Phase icons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {PHASES.map((ph, i) => (
              <div key={ph.id} style={{ textAlign: 'center', opacity: visibleCount > i ? 1 : 0.25, transition: 'opacity 0.4s' }}>
                <div style={{ fontSize: 16 }}>{ph.icon}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: ph.color, marginTop: 2 }}>{ph.hours.split('→')[0].trim()}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', opacity: done ? 1 : 0.25, transition: 'opacity 0.4s' }}>
              <div style={{ fontSize: 16 }}>🏁</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>16h</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {game.car1?.name} · {game.car2?.name}
          </div>
        </div>
      </div>

      {/* Classement live */}
      <LiveLeaderboard field={fieldRef.current} visibleCount={visibleCount} t={t} />

      {/* Phase cards */}
      <div className="sim-phase-list">
        {phases.map((phase, i) => {
          const meta = PHASES[i]
          const visible = i < visibleCount
          return (
            <div key={phase.phase_id} className={`sim-phase ${visible ? 'visible' : ''}`}
              style={{ borderLeft: visible ? `3px solid ${meta?.color || '#4ea3d9'}` : '3px solid transparent' }}>
              <div className="sim-phase-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{meta?.icon}</span>
                  <div className="sim-phase-name" style={{ color: meta?.color }}>{t('phase_' + phase.phase_id)}</div>
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
                        <div style={{ height: 4, width: 56, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${score}%`,
                            background: score >= 88 ? '#40b870' : score >= 80 ? '#f0c040' : '#d44020',
                            borderRadius: 2,
                          }} />
                        </div>
                      )}
                    </div>
                    {event && (
                      <div className={`sim-event ${['bon_stint','depassement','nuit_rapide'].includes(event.id) ? 'sim-event-pos' : 'sim-event-neg'}`}>
                        {['bon_stint','depassement','nuit_rapide'].includes(event.id) ? '✨' : '⚠️'} {event.label} — {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {done && (
        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn btn-primary btn-big" onClick={onDone}>{t('sim_see_result')}</button>
        </div>
      )}

      {!done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          {t('sim_inprogress')}
        </div>
      )}
    </div>
  )
}
