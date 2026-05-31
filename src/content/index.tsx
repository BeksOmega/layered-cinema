import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import cssText from './index.css?inline'
import './index.css' // regular import so Vite's HMR pipeline tracks this CSS file

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
}
