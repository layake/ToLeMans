import { useState, useEffect } from 'react'
import './App.css'
import { useLang } from './i18n/LangContext'
import HomeStep from './steps/HomeStep'
import StrategyStep from './steps/StrategyStep'
import CarDrawStep from './steps/CarDrawStep'
import DirectorStep from './steps/DirectorStep'
import PilotDrawStep from './steps/PilotDrawStep'
import ReviewStep from './steps/ReviewStep'
import SimulationStep from './steps/SimulationStep'
import ResultStep from './steps/ResultStep'

const PILOT_SLOTS = [
  { carNum: 1, slot: 1, label: 'Voiture 1 — Pilote 1' },
  { carNum: 1, slot: 2, label: 'Voiture 1 — Pilote 2' },
  { carNum: 1, slot: 3, label: 'Voiture 1 — Pilote 3' },
  { carNum: 2, slot: 1, label: 'Voiture 2 — Pilote 1' },
  { carNum: 2, slot: 2, label: 'Voiture 2 — Pilote 2' },
  { carNum: 2, slot: 3, label: 'Voiture 2 — Pilote 3' },
]

const STRATEGY_ICONS = { attaque: '⚡', conservation: '🛡️', equilibre: '⚖️' }
// strategy labels now via t()

const phaseOrder = ['strategy', 'car1', 'car2', 'director', 'pilot0', 'pilot1', 'pilot2', 'pilot3', 'pilot4', 'pilot5', 'review']

export default function App() {
  const { lang, toggle, t } = useLang()
  const [phase, setPhase] = useState('home')
  const [rerolls, setRerolls] = useState(3)
  const [config, setConfig] = useState({ start_budget: 280, max_start_position: 20, currency: 'M€' })
  const [game, setGame] = useState({
    strategy: null,
    car1: null,
    car2: null,
    director: null,
    pilots: [],
    chosenPilotIds: [],
    budgetSpent: 0,
  })
  const [simResult, setSimResult] = useState(null)
  const [daily, setDaily] = useState(false)
  const [dailyData, setDailyData] = useState(null)
  const [dailyDone, setDailyDone] = useState(false)

  const API = '/api'
  const budgetLeft = config.start_budget - game.budgetSpent

  // Récupère la config au démarrage
  useEffect(() => {
    fetch(`${API}/config`).then(r => r.json()).then(setConfig).catch(() => {})
  }, [])

  // Vérifie si la daily du jour est déjà jouée
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const done = localStorage.getItem('tlm_daily_' + today)
    setDailyDone(!!done)
  }, [phase])

  // Recale le scroll en haut à chaque changement d'étape
  useEffect(() => {
    const sc = document.querySelector('.app-body')
    if (sc) sc.scrollTop = 0
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [phase])

  const drawnCarIds = [game.car1?.id, game.car2?.id].filter(Boolean)
  const currentPilotIndex = phase.startsWith('pilot') ? parseInt(phase.replace('pilot', '')) : -1
  const currentSlot = currentPilotIndex >= 0 ? PILOT_SLOTS[currentPilotIndex] : null
  const stepIndex = phaseOrder.indexOf(phase)

  const pilots_car1 = game.pilots.slice(0, 3)
  const pilots_car2 = game.pilots.slice(3, 6)

  function setStrategy(s) {
    setGame(g => ({ ...g, strategy: s }))
    setPhase(daily ? 'director' : 'car1')
  }

  function setCar1(car) {
    setGame(g => ({ ...g, car1: car, budgetSpent: g.budgetSpent + (car.cost || 0) }))
    setPhase('car2')
  }

  function setCar2(car) {
    setGame(g => ({ ...g, car2: car, budgetSpent: g.budgetSpent + (car.cost || 0) }))
    setPhase('director')
  }

  function setDirector(dt) {
    setGame(g => ({ ...g, director: dt, budgetSpent: g.budgetSpent + (dt.cost || 0) }))
    setPhase('pilot0')
  }

  function addPilot(pilot) {
    setGame(g => ({
      ...g,
      pilots: [...g.pilots, pilot],
      chosenPilotIds: [...g.chosenPilotIds, pilot.id],
      budgetSpent: g.budgetSpent + (pilot.cost || 0),
    }))
    const nextIndex = currentPilotIndex + 1
    setPhase(nextIndex >= 6 ? 'review' : `pilot${nextIndex}`)
  }

  function startSimulation(result) {
    setSimResult(result)
    setPhase('simulation')
  }

  function showResult() {
    setPhase('result')
  }

  function startFree() {
    setDaily(false)
    setDailyData(null)
    setRerolls(3)
    setGame({ strategy: null, car1: null, car2: null, director: null, pilots: [], chosenPilotIds: [], budgetSpent: 0 })
    setPhase('strategy')
  }

  async function startDaily() {
    try {
      const res = await fetch(`${API}/daily`)
      const data = await res.json()
      setDailyData(data)
      setDaily(true)
      setRerolls(0)
      // Voitures imposées directement (avec coûts)
      setGame({
        strategy: null,
        car1: { ...data.car1, cost: data.car1.cost || 0 },
        car2: { ...data.car2, cost: data.car2.cost || 0 },
        director: null, pilots: [], chosenPilotIds: [],
        budgetSpent: (data.car1.cost || 0) + (data.car2.cost || 0),
        startPositions: null,
      })
      setPhase('strategy')
    } catch (e) { console.error(e) }
  }

  function restart() {
    setPhase('home')
    setRerolls(3)
    setDaily(false)
    setDailyData(null)
    setGame({ strategy: null, car1: null, car2: null, director: null, pilots: [], chosenPilotIds: [], budgetSpent: 0 })
    setSimResult(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">TLM <span>To Le Mans</span></div>
        <div className="header-right">
          <button onClick={toggle} className="lang-toggle" aria-label="language">
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          {phase !== 'result' && phase !== 'simulation' && phase !== 'home' && (
            <div className="budget-pill" style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              padding: '4px 10px', borderRadius: 6,
              background: budgetLeft < 20 ? 'rgba(216,58,44,0.15)' : 'rgba(232,181,63,0.12)',
              border: `1px solid ${budgetLeft < 20 ? 'rgba(216,58,44,0.5)' : 'rgba(232,181,63,0.4)'}`,
              color: budgetLeft < 20 ? '#ff8a7a' : '#e8b53f',
              letterSpacing: 1, whiteSpace: 'nowrap',
            }}>
              {budgetLeft}{config.currency}
            </div>
          )}
          {phase !== 'result' && phase !== 'simulation' && phase !== 'home' && !daily && (
            <div className="rerolls">
              {t('rerolls')}
              {[0, 1, 2].map(i => (
                <div key={i} className={`reroll-pip ${i >= rerolls ? 'used' : ''}`} />
              ))}
            </div>
          )}
          {stepIndex >= 0 && (
            <div className="step-indicator">
              {phaseOrder.map((p, i) => (
                <div key={p} className={`step-dot ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <div className="main-panel">
          {phase === 'home' && <HomeStep t={t} onStartFree={startFree} onStartDaily={startDaily} dailyDone={dailyDone} budget={config.start_budget} />}
          {phase === 'strategy' && <StrategyStep onSelect={setStrategy} t={t} />}
          {phase === 'car1' && <CarDrawStep carNum={1} excludeIds={drawnCarIds} budgetLeft={budgetLeft} rerolls={rerolls} onReroll={() => setRerolls(r => r - 1)} onSelect={setCar1} t={t} />}
          {phase === 'car2' && <CarDrawStep carNum={2} excludeIds={drawnCarIds} budgetLeft={budgetLeft} rerolls={rerolls} onReroll={() => setRerolls(r => r - 1)} onSelect={setCar2} t={t} />}
          {phase === 'director' && <DirectorStep budgetLeft={budgetLeft} onSelect={setDirector} t={t} />}
          {phase.startsWith('pilot') && currentSlot && (
            <PilotDrawStep
              strategy={game.strategy}
              currentPilots={game.pilots}
              key={phase}
              slot={currentSlot}
              pilotIndex={currentPilotIndex}
              chosenPilotIds={game.chosenPilotIds}
              budgetLeft={budgetLeft}
              rerolls={rerolls}
              onReroll={() => setRerolls(r => r - 1)}
              onSelect={addPilot}
              daily={daily}
              teamPoolOrder={dailyData?.team_pool_order}
              t={t}
            />
          )}
          {phase === 'review' && <ReviewStep game={game} pilots_car1={pilots_car1} pilots_car2={pilots_car2} onStart={startSimulation} budgetLeft={budgetLeft} budgetTotal={config.start_budget} t={t} />}
          {phase === 'simulation' && simResult && <SimulationStep result={simResult} game={game} onDone={showResult} t={t} />}
          {phase === 'result' && simResult && <ResultStep result={simResult} game={game} onRestart={restart} daily={daily} t={t} />}
        </div>

        {phase !== 'result' && phase !== 'simulation' && phase !== 'home' && (
          <aside className="sidebar">
            {game.strategy && (
              <div className="sidebar-section">
                <div className="sidebar-label">{t('result_strategy')}</div>
                <div className="sidebar-strategy">{STRATEGY_ICONS[game.strategy]} {t('strat_' + game.strategy + '_name')}</div>
              </div>
            )}
            <div className="sidebar-section">
              <div className="sidebar-label">{t('review_car')} 1</div>
              {game.car1 ? (
                <div className="sidebar-item">
                  <div className="sidebar-item-name">{game.car1.name}</div>
                  <div className="sidebar-item-sub">{game.car1.year} · {game.car1.constructor}</div>
                </div>
              ) : <div className="sidebar-empty">—</div>}
              {pilots_car1.map((p, i) => (
                <div key={p.id} className="sidebar-item">
                  <div className="sidebar-item-name">{p.nationality} {p.name}</div>
                  <div className="sidebar-item-sub">P{i + 1}</div>
                </div>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">{t('review_car')} 2</div>
              {game.car2 ? (
                <div className="sidebar-item">
                  <div className="sidebar-item-name">{game.car2.name}</div>
                  <div className="sidebar-item-sub">{game.car2.year} · {game.car2.constructor}</div>
                </div>
              ) : <div className="sidebar-empty">—</div>}
              {pilots_car2.map((p, i) => (
                <div key={p.id} className="sidebar-item">
                  <div className="sidebar-item-name">{p.nationality} {p.name}</div>
                  <div className="sidebar-item-sub">P{i + 1}</div>
                </div>
              ))}
            </div>
            {game.director && (
              <div className="sidebar-section">
                <div className="sidebar-label">{t('review_dt')}</div>
                <div className="sidebar-item">
                  <div className="sidebar-item-name">{game.director.name}</div>
                  <div className="sidebar-item-sub">{game.director.specialty}</div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
