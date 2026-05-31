# layered-cinema

A Chrome extension that injects UI into YouTube.

## Stack

- **Vite** + **CRXJS** — bundling and Chrome extension tooling
- **TypeScript** + **React** — content script UI
- **Tailwind v4** — styling, isolated in Shadow DOM to avoid conflicts with YouTube's styles
- **shadcn** + **@base-ui/react** — component primitives
- **Vitest** — unit tests
- **Storybook** — component development in isolation

## Dev workflow

### First-time setup

```bash
pnpm install
```

Load the extension in Chrome:
1. Run `pnpm dev`
2. Open `chrome://extensions/` and enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder
4. Navigate to YouTube — the extension is active

### Making changes

```bash
pnpm dev   # rebuilds dist/ on every save (~1s)
```

After saving a file, click the **reload icon** on the extension card in `chrome://extensions/`. The background service worker will automatically reload any open YouTube tabs so the new content script injects immediately.

CSS and component changes hot-reload in place without needing an extension reload.

### Other commands

```bash
pnpm build          # production build
pnpm test           # run unit tests
pnpm test:ui        # vitest UI
pnpm storybook      # component dev server on :6006
```
