import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import CinemaModeToggle from './CinemaModeToggle';
import cssText from './index.css?inline';
import './index.css'; // regular import so Vite's HMR pipeline tracks this CSS file
import { extractYoutubeVideoId, hasFilmData } from '@/lib/filmIndex';
import cinemaCssText from './youtube-cinema.css?inline';

const CINEMA_STYLE_ID = 'layered-cinema-host-styles';
const SIDEBAR_ID = 'layered-cinema-sidebar';
const ROOT_ID = 'layered-cinema-root';

// Tracks the video ID for which cinema mode is currently active (null = inactive).
let activeVideoId: string | null = null;

// --- Persistent shadow root overlay ---
document.getElementById(ROOT_ID)?.remove();
const container = document.createElement('div');
container.id = ROOT_ID;
document.body.appendChild(container);
const shadow = container.attachShadow({ mode: 'open' });
const style = document.createElement('style');
style.textContent = cssText;
shadow.appendChild(style);
const mountPoint = document.createElement('div');
shadow.appendChild(mountPoint);
const root: Root = createRoot(mountPoint);
root.render(<App />);

function injectSidebarToggle() {
  if (!activeVideoId) return;
  if (document.getElementById(SIDEBAR_ID)) return;
  const secondary = document.querySelector('#secondary');
  if (!secondary) return;

  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = SIDEBAR_ID;
  const sidebarShadow = sidebarContainer.attachShadow({ mode: 'open' });
  const sidebarStyle = document.createElement('style');
  sidebarStyle.textContent = cssText;
  sidebarShadow.appendChild(sidebarStyle);
  const sidebarMount = document.createElement('div');
  sidebarShadow.appendChild(sidebarMount);
  secondary.insertBefore(sidebarContainer, secondary.firstChild);
  createRoot(sidebarMount).render(<CinemaModeToggle videoId={activeVideoId as string} />);
}

function teardown() {
  document.getElementById(CINEMA_STYLE_ID)?.remove();
  document.getElementById(SIDEBAR_ID)?.remove();
  document.documentElement.removeAttribute('data-layered-cinema');
  activeVideoId = null;
}

async function updateForCurrentVideo() {
  const videoId = extractYoutubeVideoId(window.location.href);

  // Navigate away from a watch page or to a different video — clean up first.
  if (videoId !== activeVideoId) teardown();
  if (!videoId) return;

  const hasData = await hasFilmData(videoId);
  // Guard: user may have navigated while we were fetching.
  if (videoId !== extractYoutubeVideoId(window.location.href)) return;
  if (!hasData) return;

  activeVideoId = videoId;
  const savedState = localStorage.getItem(`layered-cinema:${videoId}`);
  document.documentElement.dataset.layeredCinema = savedState === 'on' ? 'on' : 'off';

  const cinemaStyle = document.createElement('style');
  cinemaStyle.id = CINEMA_STYLE_ID;
  cinemaStyle.textContent = cinemaCssText;
  document.head.appendChild(cinemaStyle);

  injectSidebarToggle();
}

// Watch for #secondary to appear — YouTube rebuilds it on each SPA navigation.
const sidebarObserver = new MutationObserver(injectSidebarToggle);
sidebarObserver.observe(document.body, { childList: true, subtree: true });

// React to YouTube SPA navigations.
document.addEventListener('yt-navigate-finish', updateForCurrentVideo);

// Run on initial page load.
updateForCurrentVideo();

if (import.meta.hot) {
  import.meta.hot.accept('./App', (newModule) => {
    if (newModule?.default) root.render(createElement(newModule.default));
  });
  import.meta.hot.accept('./index.css?inline', (newModule) => {
    if (newModule?.default) style.textContent = newModule.default;
  });
  import.meta.hot.accept('./youtube-cinema.css?inline', (newModule) => {
    if (newModule?.default) {
      const existing = document.getElementById(CINEMA_STYLE_ID);
      if (existing) existing.textContent = newModule.default;
    }
  });
}
