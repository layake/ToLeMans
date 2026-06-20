export default function StrategyStep({ onSelect, t }) {
  const STRATEGIES = [
    { id: 'attaque', icon: '⚡', name: t('strat_attaque_name'), desc: t('strat_attaque_desc'),
      tags: [{ label: t('tag_pace_max'), type: 'pos' }, { label: t('tag_usure'), type: 'neg' }, { label: t('tag_casse'), type: 'neg' }] },
    { id: 'equilibre', icon: '⚖️', name: t('strat_equilibre_name'), desc: t('strat_equilibre_desc'),
      tags: [{ label: t('tag_polyvalent'), type: 'pos' }, { label: t('tag_solide'), type: 'pos' }] },
    { id: 'conservation', icon: '🛡️', name: t('strat_conservation_name'), desc: t('strat_conservation_desc'),
      tags: [{ label: t('tag_fiab_max'), type: 'pos' }, { label: t('tag_endurance'), type: 'pos' }, { label: t('tag_pace_low'), type: 'neg' }] },
  ]
  return (
    <div className="screen-enter">
      <div className="step-header">
        <div className="step-eyebrow">{t('strat_eyebrow')}</div>
        <div className="step-title">{t('strat_title')}</div>
        <div className="step-desc">{t('strat_desc')}</div>
      </div>
      <div className="strategy-grid">
        {STRATEGIES.map(s => (
          <div key={s.id} className="strategy-card" onClick={() => onSelect(s.id)}>
            <div className="strategy-icon">{s.icon}</div>
            <div className="strategy-info">
              <div className="strategy-name">{s.name}</div>
              <div className="strategy-desc">{s.desc}</div>
              <div className="strategy-tags">
                {s.tags.map(tag => <span key={tag.label} className={`tag ${tag.type}`}>{tag.label}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
