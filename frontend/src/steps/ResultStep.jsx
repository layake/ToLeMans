import { useEffect, useState } from 'react'
import { shareResult } from '../shareCard'
import { VERSION } from '../version'

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

export default function ResultStep({ result, game, onRestart, daily, t }) {
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
  const VERDICT_MAP = {
    wire_to_wire: { title: t('verdict_wire_title'), subtitle: t('verdict_wire_sub'), emoji: '🌟' },
    victoire: { title: t('verdict_win_title'), subtitle: t('verdict_win_sub'), emoji: '👑' },
    podium: { title: t('verdict_podium_title'), subtitle: t('verdict_podium_sub'), emoji: '🥉' },
    finisher: { title: t('verdict_finish_title'), subtitle: t('verdict_finish_sub'), emoji: '🏁' },
    abandon: { title: t('verdict_dnf_title'), subtitle: t('verdict_dnf_sub'), emoji: '💀' },
  }
  const verdict = VERDICT_MAP[result.verdict] || VERDICT_MAP.finisher
  // Médaille dynamique selon la position réelle sur le podium
  let displayEmoji = verdict.emoji
  if (result.verdict === 'podium') {
    displayEmoji = result.best_position === 2 ? '🥈' : '🥉'
  }
  const phases = result.phase_summaries || []
  const bestCar = result.winning_car === 1 ? game.car1 : game.car2
  const celebrate = ['wire_to_wire', 'victoire'].includes(result.verdict)
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)
    try { await shareResult(result, game, VERSION) }
    catch (e) { console.error('share failed', e) }
    finally { setSharing(false) }
  }

  return (
    <div className="result-screen">
      {celebrate && <Confetti />}
      <div style={{ fontSize: 64, marginBottom: 8 }}>{displayEmoji}</div>

      {result.best_position && <div className="result-position">{t('result_position')} {result.best_position} / 50</div>}

      {/* Position de départ → arrivée */}
      {result.budget_overspend > 0 && (
        <div style={{
          textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11,
          color: '#ff8a7a', letterSpacing: 1, marginBottom: 8,
        }}>
          ⚠️ Budget dépassé de {result.budget_overspend}M€ → malus appliqué
        </div>
      )}

      {result.best_position && (result.start_position_car1 || result.start_position_car2) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
          marginTop: 4, marginBottom: 8, letterSpacing: 1,
        }}>
          <span style={{ opacity: 0.7 }}>
            Départ P{result.winning_car === 1 ? result.start_position_car1 : result.start_position_car2}
          </span>
          <span style={{ color: 'var(--gold)' }}>→</span>
          <span style={{ color: 'var(--cream)', fontWeight: 700 }}>
            P{result.best_position}
          </span>
        </div>
      )}

      <div className={`result-verdict ${result.verdict}`}>{verdict.title}</div>
      <div className="result-subtitle">{verdict.subtitle}</div>

      {typeof result.score === 'number' && (
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(8,32,61,0.45)', border: '1px solid rgba(232,181,63,0.5)',
          borderRadius: 'var(--radius-lg)', padding: '12px 40px', margin: '4px 0 26px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 3 }}>{t('result_score')}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, color: 'var(--gold)' }}>{result.score}</div>
        </div>
      )}

      {bestCar && result.best_position && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 30,
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 20px',
        }}>
          {t('result_best_car')} : {bestCar.name} · {bestCar.year}
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
              <div className="result-phase-label">{t('phase_' + phase.phase_id)}</div>
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
        DT : {game.director?.name} · {t('result_strategy')} : {t('strat_' + game.strategy + '_name')}
      </div>

      {daily && lockedDaily && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#bcdcf2', marginBottom: 16, letterSpacing: 1 }}>
          {t('result_daily_locked')} : {(VERDICT_MAP[lockedDaily.verdict] || VERDICT_MAP.finisher).title}{lockedDaily.position ? ` (P${lockedDaily.position})` : ''}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <button className="btn btn-secondary" onClick={handleShare} disabled={sharing}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {sharing ? '…' : `📸 ${t('result_share')}`}
        </button>
        <button className="btn btn-primary btn-big" onClick={onRestart} style={{ width: '100%' }}>{daily ? t('result_back') : t('result_replay')}</button>
      </div>
    </div>
  )
}
