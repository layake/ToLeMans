export default function HomeStep({ onStartFree, onStartDaily, dailyDone, t }) {
  const steps = [
    { n: '01', title: t('home_step1_title'), text: t('home_step1_text') },
    { n: '02', title: t('home_step2_title'), text: t('home_step2_text') },
    { n: '03', title: t('home_step3_title'), text: t('home_step3_text') },
    { n: '04', title: t('home_step4_title'), text: t('home_step4_text') },
  ]

  return (
    <div className="screen-enter" style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 28 }}>
        {['#4ea3d9', '#f4efe3', '#d83a2c', '#e8b53f', '#0d2c52'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue-sky)', letterSpacing: 4, marginBottom: 10 }}>
          {t('home_eyebrow')}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 92, letterSpacing: 2, color: 'var(--cream)', lineHeight: 0.82 }}>
          {t('home_title_1')}<br />{t('home_title_2')}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, margin: '20px auto 34px', maxWidth: 400 }}>
        {t('home_intro')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '15px 18px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, color: 'var(--blue-sky)', minWidth: 38 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary" onClick={onStartFree} style={{ width: '100%', padding: 18, fontSize: 22, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>
          {t('home_btn_free')}
        </button>
        <button className="btn btn-secondary" onClick={onStartDaily} style={{ width: '100%', padding: 16, fontSize: 18, letterSpacing: 1, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {t('home_btn_daily')}
          {dailyDone && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--blue-sky)', letterSpacing: 1 }}>{t('home_daily_done')}</span>}
        </button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2, lineHeight: 1.5 }}>
          {t('home_daily_desc')}
        </div>
      </div>
    </div>
  )
}
