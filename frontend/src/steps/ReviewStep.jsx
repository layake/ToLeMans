import { useState } from 'react'

const API = '/api'
const STRATEGY_LABELS = { attaque: '⚡ Attaque', conservation: '🛡️ Conservation', equilibre: '⚖️ Équilibré' }

export default function ReviewStep({ game, pilots_car1, pilots_car2, onStart }) {
  const [loading, setLoading] = useState(false)

  async function launch() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: game.strategy,
          car1: game.car1,
          car2: game.car2,
          director: game.director,
          pilots_car1,
          pilots_car2,
        }),
      })
      const data = await res.json()
      onStart(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-label">Étape 11 / 11</div>
        <div className="step-title">Revue d'Équipe</div>
        <div className="step-desc">
          Votre écurie est prête. Vérifiez la composition avant de lancer les 24 Heures.
        </div>
      </div>

      <div className="review-strategy-block">
        {STRATEGY_LABELS[game.strategy]} — relais {game.strategy === 'attaque' ? '2h' : game.strategy === 'equilibre' ? '3h' : '4h'}
      </div>

      <div className="review-grid">
        {[{ car: game.car1, pilots: pilots_car1, num: 1 }, { car: game.car2, pilots: pilots_car2, num: 2 }].map(({ car, pilots, num }) => (
          <div key={num} className="review-car-block">
            <div className="review-car-title">VOITURE {num}</div>
            <div className="review-car-name">{car?.name}<br /><span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{car?.year} · {car?.constructor}</span></div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span className="tag">PERF {car?.performance}</span>
              <span className="tag">FIAB {car?.reliability}</span>
            </div>
            <div className="review-pilot-list">
              {pilots.map((p, i) => (
                <div key={p.id} className="review-pilot">
                  <span className="review-pilot-slot">P{i + 1}</span>
                  <span>{p.nationality} {p.name}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{p.year}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="review-director-block">
        <div className="review-car-title">DIRECTEUR TECHNIQUE</div>
        <div className="review-car-name">{game.director?.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{game.director?.description}</div>
      </div>

      <div className="btn-row">
        {loading ? (
          <div className="loading-overlay" style={{ padding: '20px 0' }}>
            <div className="spinner" />
            <div className="loading-text">DÉPART IMMINENT…</div>
          </div>
        ) : (
          <button className="btn btn-primary btn-big" onClick={launch}>
            🏁 Lancer les 24 Heures →
          </button>
        )}
      </div>
    </div>
  )
}
