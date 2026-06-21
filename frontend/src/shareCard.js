// Génère une carte de résultat partageable (PNG) via canvas — sans dépendance.

const VERDICT_LABELS = {
  wire_to_wire: 'WIRE-TO-WIRE',
  victoire: 'VAINQUEUR',
  podium: 'PODIUM',
  finisher: "À L'ARRIVÉE",
  abandon: 'ABANDON',
}

function medalFor(result) {
  if (result.verdict === 'wire_to_wire') return '🌟'
  if (result.verdict === 'victoire') return '👑'
  if (result.verdict === 'podium') return result.best_position === 2 ? '🥈' : '🥉'
  if (result.verdict === 'finisher') return '🏁'
  return '💀'
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function buildCardBlob(result, game, version) {
  // Polices prêtes (sinon le canvas dessine en fallback)
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready } catch (e) {}
  }

  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fond façon affiche : ciel → nuit
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#4ea3d9')
  grad.addColorStop(0.35, '#1f6fb2')
  grad.addColorStop(0.7, '#0d2c52')
  grad.addColorStop(1, '#08203d')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Halo soleil
  const sun = ctx.createRadialGradient(W * 0.5, 230, 30, W * 0.5, 230, 380)
  sun.addColorStop(0, 'rgba(244,239,227,0.35)')
  sun.addColorStop(1, 'rgba(244,239,227,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, W, 600)

  // Bande drapeau
  const bands = ['#4ea3d9', '#f4efe3', '#d83a2c', '#e8b53f', '#0d2c52']
  const bw = W / bands.length
  bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * bw, 0, bw, 12) })

  const cx = W / 2
  ctx.textAlign = 'center'

  // En-tête
  ctx.fillStyle = '#f4efe3'
  ctx.font = "600 30px 'JetBrains Mono', monospace"
  ctx.fillText('TO LE MANS', cx, 80)
  ctx.fillStyle = 'rgba(244,239,227,0.8)'
  ctx.font = "400 20px 'JetBrains Mono', monospace"
  ctx.fillText('24 HEURES · DREAM TEAM', cx, 116)

  // Médaille
  ctx.font = "120px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'"
  ctx.fillText(medalFor(result), cx, 300)

  // Position
  if (result.best_position) {
    ctx.fillStyle = 'rgba(244,239,227,0.85)'
    ctx.font = "400 26px 'JetBrains Mono', monospace"
    ctx.fillText(`POSITION ${result.best_position} / 50`, cx, 360)
  }

  // Verdict
  ctx.fillStyle = result.verdict === 'wire_to_wire' ? '#e8b53f' : '#f4efe3'
  ctx.font = "400 130px 'Bebas Neue', Impact, sans-serif"
  ctx.fillText(VERDICT_LABELS[result.verdict] || 'RÉSULTAT', cx, 480)

  // Bloc SCORE
  roundRect(ctx, cx - 320, 540, 640, 180, 24)
  ctx.fillStyle = 'rgba(8,32,61,0.55)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(232,181,63,0.6)'; ctx.lineWidth = 2; ctx.stroke()
  ctx.fillStyle = 'rgba(244,239,227,0.75)'
  ctx.font = "400 24px 'JetBrains Mono', monospace"
  ctx.fillText('SCORE', cx, 590)
  ctx.fillStyle = '#e8b53f'
  ctx.font = "400 120px 'Bebas Neue', Impact, sans-serif"
  ctx.fillText(String(result.score ?? '—'), cx, 700)

  // Meilleure voiture
  const bestCar = result.winning_car === 1 ? game.car1 : game.car2
  if (bestCar) {
    ctx.fillStyle = '#f4efe3'
    ctx.font = "400 52px 'Bebas Neue', Impact, sans-serif"
    ctx.fillText(bestCar.name.toUpperCase(), cx, 810)
    ctx.fillStyle = 'rgba(244,239,227,0.7)'
    ctx.font = "400 24px 'JetBrains Mono', monospace"
    ctx.fillText(`${bestCar.year} · ${bestCar.constructor || ''}`, cx, 848)
  }

  // Les 2 voitures alignées + DT + stratégie
  const stratLabel = { attaque: '⚡ Attaque', equilibre: '⚖️ Équilibré', conservation: '🛡️ Conservation' }[game.strategy] || game.strategy
  const lines = [
    `${game.car1?.name || ''}  ·  ${game.car2?.name || ''}`,
    `DT : ${game.director?.name || ''}`,
    stratLabel,
  ]
  ctx.fillStyle = 'rgba(244,239,227,0.85)'
  ctx.font = "400 26px 'JetBrains Mono', monospace"
  let y = 950
  lines.forEach(l => { ctx.fillText(l, cx, y); y += 44 })

  // Pied
  ctx.fillStyle = 'rgba(244,239,227,0.5)'
  ctx.font = "400 20px 'JetBrains Mono', monospace"
  const date = new Date().toISOString().slice(0, 10)
  ctx.fillText(`tlm.lensslo.com  ·  ${version || ''}  ·  ${date}`, cx, H - 60)

  return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

// Partage natif si dispo, sinon téléchargement
export async function shareResult(result, game, version) {
  const blob = await buildCardBlob(result, game, version)
  if (!blob) return { ok: false }
  const file = new File([blob], 'to-le-mans.png', { type: 'image/png' })
  const text = `${VERDICT_LABELS[result.verdict] || ''} · ${result.score} pts — To Le Mans`

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'To Le Mans', text })
      return { ok: true, method: 'share' }
    } catch (e) {
      if (e.name === 'AbortError') return { ok: true, method: 'cancel' }
    }
  }
  // Fallback : téléchargement
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'to-le-mans.png'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { ok: true, method: 'download' }
}
