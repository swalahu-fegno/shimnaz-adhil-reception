import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

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
