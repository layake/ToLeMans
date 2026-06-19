const STRATEGIES = [
  {
    id: 'attaque',
    icon: '⚡',
    name: 'Attaque',
    desc: 'Relais courts, rythme maximal. La victoire ou l\'abandon.',
    tags: [
      { label: 'Pace max', type: 'pos' },
      { label: 'Usure élevée', type: 'neg' },
      { label: 'Casse +', type: 'neg' },
    ],
  },
  {
    id: 'equilibre',
    icon: '⚖️',
    name: 'Équilibré',
    desc: 'Le compromis parfait. Rythme soutenu, fiabilité préservée.',
    tags: [
      { label: 'Polyvalent', type: 'pos' },
      { label: 'Solide', type: 'pos' },
    ],
  },
  {
    id: 'conservation',
    icon: '🛡️',
    name: 'Conservation',
    desc: 'Relais longs, la mécanique avant tout. Finir, puis gagner.',
    tags: [
      { label: 'Fiabilité max', type: 'pos' },
      { label: 'Endurance', type: 'pos' },
      { label: 'Pace -', type: 'neg' },
    ],
  },
]

export default function StrategyStep({ onSelect }) {
  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">Étape 1 / 11 · Stratégie</div>
        <div className="step-title">Stratégie</div>
        <div className="step-desc">
          Choisissez votre philosophie de course. Elle définit la durée de vos relais
          et oriente chaque phase des 24 Heures.
        </div>
      </div>

      <div className="strategy-grid">
        {STRATEGIES.map(s => (
          <div
            key={s.id}
            className="strategy-card"
            onClick={() => onSelect(s.id)}
          >
            <div className="strategy-icon">{s.icon}</div>
            <div className="strategy-info">
              <div className="strategy-name">{s.name}</div>
              <div className="strategy-desc">{s.desc}</div>
              <div className="strategy-tags">
                {s.tags.map(t => (
                  <span key={t.label} className={`tag ${t.type}`}>{t.label}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
