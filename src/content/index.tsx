import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import CinemaModeToggle from './CinemaModeToggle'
import cssText from './index.css?inline'
import './index.css' // regular import so Vite's HMR pipeline tracks this CSS file
import cinemaCssText from './youtube-cinema.css?inline'

// Default to cinema mode on.
document.documentElement.dataset.layeredCinema = 'on'

// Inject cinema mode CSS directly into the host page (not shadow root)
// so it can target YouTube's own DOM elements.
const CINEMA_STYLE_ID = 'layered-cinema-host-styles'
document.getElementById(CINEMA_STYLE_ID)?.remove()
const cinemaStyle = document.createElement('style')
cinemaStyle.id = CINEMA_STYLE_ID
cinemaStyle.textContent = cinemaCssText
document.head.appendChild(cinemaStyle)

// --- Shadow root overlay (reserved for future overlay UI) ---
const ROOT_ID = 'layered-cinema-root'
document.getElementById(ROOT_ID)?.remove()
const container = document.createElement('div')
container.id = ROOT_ID
document.body.appendChild(container)
const shadow = container.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = cssText
shadow.appendChild(style)
const mountPoint = document.createElement('div')
shadow.appendChild(mountPoint)
const root: Root = createRoot(mountPoint)
root.render(<App />)

// --- Sidebar toggle injection ---
const SIDEBAR_ID = 'layered-cinema-sidebar'

function injectSidebarToggle() {
  if (document.getElementById(SIDEBAR_ID)) return
  const secondary = document.querySelector('#secondary')
  if (!secondary) return

  const sidebarContainer = document.createElement('div')
  sidebarContainer.id = SIDEBAR_ID
  // Needs its own shadow root + styles so Tailwind/shadcn classes work here too.
  const sidebarShadow = sidebarContainer.attachShadow({ mode: 'open' })
  const sidebarStyle = document.createElement('style')
  sidebarStyle.textContent = cssText
  sidebarShadow.appendChild(sidebarStyle)
  const sidebarMount = document.createElement('div')
  sidebarShadow.appendChild(sidebarMount)

  secondary.insertBefore(sidebarContainer, secondary.firstChild)
  createRoot(sidebarMount).render(<CinemaModeToggle />)
}

// Watch for #secondary to appear (YouTube is a SPA — it may not exist yet,
// and it gets rebuilt on each navigation).
const sidebarObserver = new MutationObserver(injectSidebarToggle)
sidebarObserver.observe(document.body, { childList: true, subtree: true })
injectSidebarToggle() // also try immediately

if (import.meta.hot) {
  import.meta.hot.accept('./App', (newModule) => {
    if (newModule?.default) root.render(createElement(newModule.default))
  })
  import.meta.hot.accept('./index.css?inline', (newModule) => {
    if (newModule?.default) style.textContent = newModule.default
  })
  import.meta.hot.accept('./youtube-cinema.css?inline', (newModule) => {
    if (newModule?.default) cinemaStyle.textContent = newModule.default
  })
}
