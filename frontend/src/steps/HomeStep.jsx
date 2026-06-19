const STEPS = [
  { n: '01', title: 'Tire ton équipe', text: 'Stratégie, deux voitures et un directeur technique, à travers toutes les époques du Mans.' },
  { n: '02', title: 'Choisis tes pilotes', text: 'À chaque tour, deux écuries te sont proposées. Pioche un pilote parmi les six.' },
  { n: '03', title: 'Lance les 24 Heures', text: 'La course se simule, du départ à 16h jusqu\'au lendemain. Jour, nuit, météo, casse.' },
  { n: '04', title: 'Vise le parfait', text: 'Finir, gagner… ou réussir le Wire-to-Wire en menant de bout en bout.' },
]

// Affiche vintage dessinée — voiture + soleil + piste
function PosterArt() {
  return (
    <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}>
      {/* Soleil */}
      <circle cx="180" cy="80" r="46" fill="#f4efe3" opacity="0.95" />
      {/* Rayons */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        const x1 = 180 + Math.cos(a) * 54, y1 = 80 + Math.sin(a) * 54
        const x2 = 180 + Math.cos(a) * 66, y2 = 80 + Math.sin(a) * 66
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f4efe3" strokeWidth="3" opacity="0.5" />
      })}
      {/* Piste qui fuit */}
      <path d="M60 220 L160 120 L200 120 L300 220 Z" fill="#0d2c52" opacity="0.55" />
      <line x1="180" y1="120" x2="180" y2="220" stroke="#f4efe3" strokeWidth="3" strokeDasharray="8 10" opacity="0.6" />
      {/* Voiture stylisée (proto) */}
      <g transform="translate(150,150)">
        <path d="M0 28 Q6 10 34 10 L52 10 Q66 10 70 22 L72 28 Q72 34 64 34 L8 34 Q0 34 0 28 Z" fill="#d83a2c" />
        <path d="M30 12 Q34 4 46 4 L52 10 L34 10 Z" fill="#0a1a2f" opacity="0.85" />
        <circle cx="16" cy="34" r="7" fill="#0a1a2f" />
        <circle cx="56" cy="34" r="7" fill="#0a1a2f" />
        <circle cx="16" cy="34" r="3" fill="#f4efe3" />
        <circle cx="56" cy="34" r="3" fill="#f4efe3" />
      </g>
    </svg>
  )
}

export default function HomeStep({ onStart }) {
  return (
    <div className="screen-enter" style={{ maxWidth: 540, margin: '0 auto' }}>
      <PosterArt />

      <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 68, letterSpacing: 3, color: 'var(--cream)', lineHeight: 0.9 }}>
          VERS LE MANS
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--blue-sky)', letterSpacing: 3, marginTop: 6 }}>
          DREAM TEAM · 24 HEURES · TOUTES LES ÉPOQUES
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {STEPS.map(s => (
          <div key={s.n} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '15px 18px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1,
              color: 'var(--blue-sky)', minWidth: 36,
            }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--cream)', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={onStart} style={{ width: '100%', padding: 18, fontSize: 20, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>
        COMMENCER LA PARTIE
      </button>
    </div>
  )
}
