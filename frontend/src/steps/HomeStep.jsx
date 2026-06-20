const STEPS = [
  { n: '01', title: 'Tire ton équipe', text: 'Stratégie, deux voitures et un directeur technique, à travers toutes les époques du Mans.' },
  { n: '02', title: 'Choisis tes pilotes', text: 'À chaque tour, deux écuries te sont proposées. Pioche un pilote parmi les six.' },
  { n: '03', title: 'Lance les 24 Heures', text: 'La course se simule, du départ à 16h jusqu\'au lendemain. Jour, nuit, météo, casse.' },
  { n: '04', title: 'Vise le parfait', text: 'Finir, gagner… ou réussir le Wire-to-Wire en menant de bout en bout.' },
]

export default function HomeStep({ onStart }) {
  return (
    <div className="screen-enter" style={{ maxWidth: 540, margin: '0 auto' }}>
      {/* Bandeau course façon affiche — pur CSS */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 28 }}>
        {['#4ea3d9', '#f4efe3', '#d83a2c', '#e8b53f', '#0d2c52'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue-sky)', letterSpacing: 4, marginBottom: 10 }}>
          24 HEURES · ENDURANCE · DEPUIS 1923
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 92, letterSpacing: 2, color: 'var(--cream)', lineHeight: 0.82 }}>
          VERS<br />LE MANS
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, margin: '20px auto 34px', maxWidth: 400 }}>
        Constitue une écurie de rêve à travers toutes les époques
        et tente de gagner la plus grande course d'endurance du monde.
      </div>

      {/* Étapes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {STEPS.map(s => (
          <div key={s.n} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '15px 18px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, color: 'var(--blue-sky)', minWidth: 38 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={onStart} style={{ width: '100%', padding: 18, fontSize: 22, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>
        COMMENCER LA PARTIE
      </button>
    </div>
  )
}
