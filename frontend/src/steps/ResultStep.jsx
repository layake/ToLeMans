import { useEffect, useState } from 'react'

const VERDICT_TEXT = {
  wire_to_wire: { title: 'WIRE-TO-WIRE', subtitle: 'Le parfait absolu. Ton équipe a mené de la première à la dernière minute. Le Mans t\'appartient.', emoji: '🌟' },
  victoire: { title: 'VAINQUEUR', subtitle: 'Victoire aux 24 Heures du Mans. Ton équipe franchit la ligne en tête.', emoji: '👑' },
  podium: { title: 'PODIUM', subtitle: 'Ton équipe monte sur le podium. Pas la victoire — mais tout près.', emoji: '🥉' },
  finisher: { title: 'À L\'ARRIVÉE', subtitle: 'La voiture passe le drapeau à damiers. Finir Le Mans, c\'est déjà un exploit.', emoji: '🏁' },
  abandon: { title: 'ABANDON', subtitle: 'Aucune voiture n\'a vu l\'arrivée. Le Mans est impitoyable.', emoji: '💀' },
}

const CONFETTI_COLORS = ['#f5c542', '#3ecf7a', '#5a7cff', '#ff8c42', '#f0f1f8']

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.5 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    }))
  )
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(105vh) rotate(720deg); opacity: 0.3; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          width: p.size, height: p.size,
          background: p.color,
          transform: `rotate(${p.rotate}deg)`,
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </>
  )
}

export default function ResultStep({ result, game, onRestart, daily }) {
  // En daily : verrouille le 1er score du jour
  if (daily && typeof window !== 'undefined') {
    const today = new Date().toISOString().slice(0, 10)
    const key = 'tlm_daily_' + today
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({ verdict: result.verdict, position: result.best_position }))
    }
  }
  const lockedDaily = daily && typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('tlm_daily_' + new Date().toISOString().slice(0,10)) || 'null')
    : null
  const verdict = VERDICT_TEXT[result.verdict] || VERDICT_TEXT.finisher
  const phases = result.phase_summaries || []
  const bestCar = result.winning_car === 1 ? game.car1 : game.car2
  const celebrate = ['wire_to_wire', 'victoire'].includes(result.verdict)

  return (
    <div className="result-screen">
      {celebrate && <Confetti />}
      <div style={{ fontSize: 64, marginBottom: 8 }}>{verdict.emoji}</div>

      {result.best_position && <div className="result-position">POSITION {result.best_position} / 50</div>}

      <div className={`result-verdict ${result.verdict}`}>{verdict.title}</div>
      <div className="result-subtitle">{verdict.subtitle}</div>

      {bestCar && result.best_position && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 30,
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 20px',
        }}>
          Meilleure voiture : {bestCar.name} · {bestCar.year}
        </div>
      )}

      <div className="result-phase-recap">
        {phases.map(phase => {
          const score = Math.max(
            result.car1.phase_results.find(p => p.phase_id === phase.phase_id)?.score || 0,
            result.car2.phase_results.find(p => p.phase_id === phase.phase_id)?.score || 0
          )
          return (
            <div key={phase.phase_id} className="result-phase-row">
              <div className="result-phase-label">{phase.label}</div>
              <div className="result-phase-bar">
                <div className="result-phase-bar-fill" style={{
                  width: `${Math.min(100, score)}%`,
                  background: score >= 88 ? '#3ecf7a' : score >= 78 ? '#4ea3d9' : '#e0533a',
                }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                {Math.round(score)}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, fontStyle: 'italic' }}>
        DT : {game.director?.name} · Stratégie : {game.strategy}
      </div>

      {daily && lockedDaily && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue-sky)', marginBottom: 16, letterSpacing: 1 }}>
          DÉFI DU JOUR · Score retenu : {lockedDaily.verdict}{lockedDaily.position ? ` (P${lockedDaily.position})` : ''}
        </div>
      )}
      <button className="btn btn-primary btn-big" onClick={onRestart}>{daily ? 'Retour' : '🔁 Rejouer'}</button>
    </div>
  )
}
