import { useState, useEffect } from 'react'
import './App.css'
import { useLang } from './i18n/LangContext'
import HomeStep from './steps/HomeStep'
import DraftScreen from './steps/DraftScreen'
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
    setPhase('draft')
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
      setPhase('draft')
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
          {phase === 'draft' && (
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
          {phase === 'draft' && !daily && (
            <div className="rerolls">
              {t('rerolls')}
              {[0, 1, 2].map(i => (
                <div key={i} className={`reroll-pip ${i >= rerolls ? 'used' : ''}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <div className="main-panel">
          {phase === 'home' && <HomeStep t={t} onStartFree={startFree} onStartDaily={startDaily} dailyDone={dailyDone} budget={config.start_budget} />}
          {phase === 'draft' && (
            <DraftScreen
              game={game} setGame={setGame} config={config} budgetLeft={budgetLeft}
              daily={daily} dailyData={dailyData}
              rerolls={rerolls} onReroll={() => setRerolls(r => r - 1)}
              onLaunch={startSimulation} t={t}
            />
          )}
          {phase === 'simulation' && simResult && <SimulationStep result={simResult} game={game} onDone={showResult} t={t} />}
          {phase === 'result' && simResult && <ResultStep result={simResult} game={game} onRestart={restart} daily={daily} t={t} />}
        </div>

      </div>
    </div>
  )
}
