// A short confetti burst in brand colours for moments worth marking (rent
// paid, application in). Draws on a throwaway canvas, ~1.6s, no dependency.
// Skipped entirely for people who prefer reduced motion.

const COLORS = ["#ff6b35", "#ffd166", "#86d19a", "#1a1a1a", "#fffef9"]
const PIECES = 120
const DURATION_MS = 1600

export function celebrate() {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  try {
    navigator.vibrate?.([12, 40, 18])
  } catch {
    // vibration is optional
  }

  const canvas = document.createElement("canvas")
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.setAttribute("aria-hidden", "true")
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "100",
  })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    canvas.remove()
    return
  }
  ctx.scale(dpr, dpr)

  const w = window.innerWidth
  const h = window.innerHeight
  // Two cannons from the bottom corners, aimed up and inward.
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const left = i % 2 === 0
    const angle = (left ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.7
    const speed = 9 + Math.random() * 9
    return {
      x: left ? 0 : w,
      y: h * 0.85,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
    }
  })

  const start = performance.now()
  const frame = (now: number) => {
    const t = now - start
    ctx.clearRect(0, 0, w, h)
    ctx.globalAlpha = t > DURATION_MS - 400 ? Math.max(0, (DURATION_MS - t) / 400) : 1
    for (const p of pieces) {
      p.vy += 0.35
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.strokeStyle = "#1a1a1a"
      ctx.lineWidth = 1.5
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66)
      ctx.strokeRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66)
      ctx.restore()
    }
    if (t < DURATION_MS) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
