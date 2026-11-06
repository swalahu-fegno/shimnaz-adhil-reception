import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

// A link straight to a section skips the envelope — so drop its page tint
// and scroll lock, which the boot shell sets for the envelope.
if (window.location.hash.length > 1) document.documentElement.classList.remove('envelope-up')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Retire the boot shell (see index.html) once React has painted the real
 * Preloader over it. Both sit on the same emerald ground, so this is invisible
 * — it just stops the shell from trapping clicks.
 *
 * Waits two frames: the first lands after React's initial commit, the second
 * after that commit has actually been painted.
 */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('boot')?.remove()
    const fonts = document.createElement('link')
    fonts.rel = 'stylesheet'
    fonts.href = './fonts/fonts.css'
    document.head.appendChild(fonts)
  })
})

// Block copying, cutting, right-click and dragging content out of the page.
for (const type of ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'] as const) {
  document.addEventListener(type, (e) => e.preventDefault())
}

// Pause every endless animation in a section while it is off screen, so the
// phone only animates what the guest can see.
{
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
    { rootMargin: '20% 0px' },
  )
  const seen = new WeakSet<Element>()
  const scan = () =>
    document.querySelectorAll('#root section, #root footer').forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      io.observe(el)
    })
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true })
  scan()
}
