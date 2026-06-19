const STEPS = [
  { icon: '🎲', title: 'Tire ton équipe', text: 'Stratégie, 2 voitures et un directeur technique à travers toutes les époques du Mans.' },
  { icon: '👥', title: 'Choisis tes pilotes', text: 'À chaque tour, 2 écuries te sont proposées. Pioche 1 pilote parmi les 6.' },
  { icon: '🏁', title: 'Lance les 24 Heures', text: 'La course se simule heure par heure. Gère le jour, la nuit, la météo.' },
  { icon: '🏆', title: 'Vise le parfait', text: 'Finir, gagner… ou réussir le Wire-to-Wire en menant de bout en bout.' },
]

export default function HomeStep({ onStart }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 20 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 64, letterSpacing: 4,
          color: 'var(--yellow)', lineHeight: 1, marginBottom: 8,
          textShadow: '0 0 30px rgba(240,192,64,0.3)',
        }}>
          VERS LE MANS
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
          Constitue une écurie de rêve à travers toutes les époques
          et tente de gagner les 24 Heures du Mans.
        </div>
      </div>

      {/* How to play */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yellow)',
          letterSpacing: 2, textAlign: 'center', marginBottom: 20,
        }}>
          COMMENT JOUER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
            }}>
              <div style={{
                fontSize: 28, width: 44, height: 44, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', borderRadius: 12,
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
                  <span style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontSize: 12, marginRight: 8 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary"
        onClick={onStart}
        style={{
          width: '100%', padding: '18px', fontSize: 18, letterSpacing: 1,
          fontFamily: 'var(--font-display)',
        }}
      >
        🏁 COMMENCER LA PARTIE
      </button>
    </div>
  )
}
