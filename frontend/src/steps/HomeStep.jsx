import { VERSION, BUILD_DATE } from '../version'
import { Dashboard, ActionShell } from './DraftScreen'

const EMPTY_GAME = { strategy: null, car1: null, car2: null, director: null, pilots: [], budgetSpent: 0 }

export default function HomeStep({ onStartFree, onStartDaily, dailyDone, budget, t }) {
  return (
    <div className="screen-enter" style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <Dashboard game={EMPTY_GAME} budgetLeft={budget || 280} currency="M€" step={null} t={t} />

      <ActionShell title={t('home_btn_free')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-primary btn-big" onClick={onStartFree} style={{ width: '100%' }}>
            {t('home_btn_free')}
          </button>
          <button onClick={onStartDaily} style={{
            border: '1px solid rgba(244,239,227,0.3)', borderRadius: 8,
            padding: 'clamp(12px, 3vw, 16px)', textAlign: 'center',
            fontSize: 'clamp(11px, 2.8vw, 14px)', color: 'rgba(244,239,227,0.85)',
            letterSpacing: 2, background: 'transparent', cursor: 'pointer', width: '100%',
            fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span>📅</span>
            <span>{t('home_btn_daily')}</span>
            {dailyDone && <span style={{ color: 'var(--gold)' }}>✓</span>}
          </button>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            <div style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', color: 'rgba(244,239,227,0.5)', letterSpacing: 2 }}>
              69 écuries · 55 voitures · 7 époques
            </div>
            <div style={{ fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'rgba(244,239,227,0.3)', marginTop: 6, letterSpacing: 1 }}>
              {VERSION} · {BUILD_DATE}
            </div>
          </div>
        </div>
      </ActionShell>
    </div>
  )
}
