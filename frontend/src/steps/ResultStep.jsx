const VERDICT_TEXT = {
  wire_to_wire: {
    title: 'WIRE-TO-WIRE',
    subtitle: 'Le parfait absolu. Votre équipe a mené de la première à la dernière minute. Le Mans vous appartient.',
    emoji: '🌟',
  },
  victoire: {
    title: 'VAINQUEUR',
    subtitle: 'Victoire aux 24 Heures du Mans. Votre équipe franchise la ligne en premier.',
    emoji: '👑',
  },
  podium: {
    title: 'PODIUM',
    subtitle: 'Votre équipe monte sur le podium. Pas la victoire — mais presque.',
    emoji: '🥉',
  },
  finisher: {
    title: 'FINISHER',
    subtitle: 'La voiture passe le drapeau à damiers. Finir Le Mans, c\'est déjà une victoire.',
    emoji: '✅',
  },
  abandon: {
    title: 'ABANDON',
    subtitle: 'Ni une ni deux voitures n\'ont vu l\'arrivée. Le Mans est impitoyable.',
    emoji: '💀',
  },
}

export default function ResultStep({ result, game, onRestart }) {
  const verdict = VERDICT_TEXT[result.verdict] || VERDICT_TEXT.finisher
  const phases = result.phase_summaries || []
  const bestCar = result.winning_car === 1 ? game.car1 : game.car2

  return (
    <div className="result-screen">
      <div style={{ fontSize: 64, marginBottom: 8 }}>{verdict.emoji}</div>

      {result.best_position && (
        <div className="result-position">POSITION {result.best_position} / 50</div>
      )}

      <div className={`result-verdict ${result.verdict}`}>
        {verdict.title}
      </div>

      <div className="result-subtitle">{verdict.subtitle}</div>

      {bestCar && result.best_position && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 28,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
        }}>
          Meilleure voiture : {bestCar.name} · {bestCar.year}
        </div>
      )}

      {/* Phase recap bars */}
      <div className="result-phase-recap">
        {phases.map(phase => {
          const score = Math.max(result.car1.phase_results.find(p => p.phase_id === phase.phase_id)?.score || 0,
                                  result.car2.phase_results.find(p => p.phase_id === phase.phase_id)?.score || 0)
          const pct = Math.min(100, (score / 100) * 100)
          return (
            <div key={phase.phase_id} className="result-phase-row">
              <div className="result-phase-label">{phase.label}</div>
              <div className="result-phase-bar">
                <div
                  className="result-phase-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: score >= 88 ? 'var(--green)' : score >= 78 ? 'var(--yellow)' : 'var(--red)',
                  }}
                />
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

      <button className="btn btn-primary btn-big" onClick={onRestart}>
        🔁 Rejouer
      </button>
    </div>
  )
}
