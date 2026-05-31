import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import cssText from './index.css?inline'
import './index.css' // regular import so Vite's HMR pipeline tracks this CSS file
import cinemaCssText from './youtube-cinema.css?inline'

// Inject cinema mode CSS directly into the host page (not shadow root)
// so it can target YouTube's own DOM elements.
const CINEMA_STYLE_ID = 'layered-cinema-host-styles'
document.getElementById(CINEMA_STYLE_ID)?.remove()
const cinemaStyle = document.createElement('style')
cinemaStyle.id = CINEMA_STYLE_ID
cinemaStyle.textContent = cinemaCssText
document.head.appendChild(cinemaStyle)

const ROOT_ID = 'layered-cinema-root'

document.getElementById(ROOT_ID)?.remove()

const container = document.createElement('div')
container.id = ROOT_ID
document.body.appendChild(container)

const shadow = container.attachShadow({ mode: 'open' })

// Inject CSS into shadow root. In dev, Vite also injects a <style> tag into
// document.head — we disable it to avoid polluting the host page, then watch
// it for HMR updates so new Tailwind classes are reflected immediately.
const style = document.createElement('style')
style.textContent = cssText
shadow.appendChild(style)


const mountPoint = document.createElement('div')
shadow.appendChild(mountPoint)

const root: Root = createRoot(mountPoint)
root.render(<App />)

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
