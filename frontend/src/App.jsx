import { useState } from 'react'
import './App.css'
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
const STRATEGY_LABELS = { attaque: 'Attaque', conservation: 'Conservation', equilibre: 'Équilibré' }

const phaseOrder = ['strategy', 'car1', 'car2', 'director', 'pilot0', 'pilot1', 'pilot2', 'pilot3', 'pilot4', 'pilot5', 'review']

export default function App() {
  const [phase, setPhase] = useState('home')
  const [rerolls, setRerolls] = useState(3)
  const [game, setGame] = useState({
    strategy: null,
    car1: null,
    car2: null,
    director: null,
    pilots: [],
    chosenPilotIds: [],
  })
  const [simResult, setSimResult] = useState(null)

  const drawnCarIds = [game.car1?.id, game.car2?.id].filter(Boolean)
  const currentPilotIndex = phase.startsWith('pilot') ? parseInt(phase.replace('pilot', '')) : -1
  const currentSlot = currentPilotIndex >= 0 ? PILOT_SLOTS[currentPilotIndex] : null
  const stepIndex = phaseOrder.indexOf(phase)

  const pilots_car1 = game.pilots.slice(0, 3)
  const pilots_car2 = game.pilots.slice(3, 6)

  function setStrategy(s) {
    setGame(g => ({ ...g, strategy: s }))
    setPhase('car1')
  }

  function setCar1(car) {
    setGame(g => ({ ...g, car1: car }))
    setPhase('car2')
  }

  function setCar2(car) {
    setGame(g => ({ ...g, car2: car }))
    setPhase('director')
  }

  function setDirector(dt) {
    setGame(g => ({ ...g, director: dt }))
    setPhase('pilot0')
  }

  function addPilot(pilot) {
    setGame(g => ({
      ...g,
      pilots: [...g.pilots, pilot],
      chosenPilotIds: [...g.chosenPilotIds, pilot.id],
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

  function restart() {
    setPhase('home')
    setRerolls(3)
    setGame({ strategy: null, car1: null, car2: null, director: null, pilots: [], chosenPilotIds: [] })
    setSimResult(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">TLM <span>Vers Le Mans</span></div>
        <div className="header-right">
          {phase !== 'result' && phase !== 'simulation' && phase !== 'home' && (
            <div className="rerolls">
              REROLLS
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
          {phase === 'home' && <HomeStep onStart={() => setPhase('strategy')} />}
          {phase === 'strategy' && <StrategyStep onSelect={setStrategy} />}
          {phase === 'car1' && <CarDrawStep carNum={1} excludeIds={drawnCarIds} rerolls={rerolls} onReroll={() => setRerolls(r => r - 1)} onSelect={setCar1} />}
          {phase === 'car2' && <CarDrawStep carNum={2} excludeIds={drawnCarIds} rerolls={rerolls} onReroll={() => setRerolls(r => r - 1)} onSelect={setCar2} />}
          {phase === 'director' && <DirectorStep onSelect={setDirector} />}
          {phase.startsWith('pilot') && currentSlot && (
            <PilotDrawStep
              strategy={game.strategy}
              currentPilots={game.pilots}
              key={phase}
              slot={currentSlot}
              pilotIndex={currentPilotIndex}
              chosenPilotIds={game.chosenPilotIds}
              rerolls={rerolls}
              onReroll={() => setRerolls(r => r - 1)}
              onSelect={addPilot}
            />
          )}
          {phase === 'review' && <ReviewStep game={game} pilots_car1={pilots_car1} pilots_car2={pilots_car2} onStart={startSimulation} />}
          {phase === 'simulation' && simResult && <SimulationStep result={simResult} game={game} onDone={showResult} />}
          {phase === 'result' && simResult && <ResultStep result={simResult} game={game} onRestart={restart} />}
        </div>

        {phase !== 'result' && phase !== 'simulation' && phase !== 'home' && (
          <aside className="sidebar">
            {game.strategy && (
              <div className="sidebar-section">
                <div className="sidebar-label">Stratégie</div>
                <div className="sidebar-strategy">{STRATEGY_ICONS[game.strategy]} {STRATEGY_LABELS[game.strategy]}</div>
              </div>
            )}
            <div className="sidebar-section">
              <div className="sidebar-label">Voiture 1</div>
              {game.car1 ? (
                <div className="sidebar-item">
                  <div className="sidebar-item-name">{game.car1.name}</div>
                  <div className="sidebar-item-sub">{game.car1.year} · {game.car1.constructor}</div>
                </div>
              ) : <div className="sidebar-empty">À tirer</div>}
              {pilots_car1.map((p, i) => (
                <div key={p.id} className="sidebar-item">
                  <div className="sidebar-item-name">{p.nationality} {p.name}</div>
                  <div className="sidebar-item-sub">P{i + 1}</div>
                </div>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Voiture 2</div>
              {game.car2 ? (
                <div className="sidebar-item">
                  <div className="sidebar-item-name">{game.car2.name}</div>
                  <div className="sidebar-item-sub">{game.car2.year} · {game.car2.constructor}</div>
                </div>
              ) : <div className="sidebar-empty">À tirer</div>}
              {pilots_car2.map((p, i) => (
                <div key={p.id} className="sidebar-item">
                  <div className="sidebar-item-name">{p.nationality} {p.name}</div>
                  <div className="sidebar-item-sub">P{i + 1}</div>
                </div>
              ))}
            </div>
            {game.director && (
              <div className="sidebar-section">
                <div className="sidebar-label">Directeur Technique</div>
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
