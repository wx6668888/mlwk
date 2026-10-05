# Villa C walkthrough

The header and footer link to `/walkthrough/villa-c/`. This is a standalone static document; React, the existing room designer and backend APIs do not host or render its scene. The full page navigation also releases the scene's WebGL context when returning to the website.

The imported scene comes from the latest local `E:\villa-platform` source. Its HTML toolbar is adapted with an MLWK return link, attribution link and hide-controls button. `mlwk-entry.js` and `mlwk-entry.css` handle website integration and mobile layout; `scene.js`, geometry, renderer, navigation, furniture and material files are copied unchanged. See `public/walkthrough/villa-c/source.json` for the source modification time and scene SHA-256.

To refresh the scene after reviewing changes to the local source:

```powershell
node scripts/import-villa-walkthrough.mjs E:\villa-platform
```

English, Arabic and Chinese are passed to the viewer. French and German website entries open the English viewer and retain their website language for the return link. The entry starts at medium quality. All resources use relative URLs inside the scene directory and are copied by Vite to `dist/walkthrough/villa-c`.

Run `npm ci`, `npm run typecheck`, `npm run test:pwa` and `npm run build`. The existing Cloudflare Pages project builds `dist` from GitHub `master`. The walkthrough does not require a backend, a Python service, an API key or an R2 bucket. Cloudflare Pages serves real scene files before its automatic SPA fallback; the scene path has its own passthrough rule.

## Mobile controls

The eye button hides the toolbar, navigation, style and floor selectors, minimap, help, touch movement buttons and reticle. Only a 44px restore button remains. Restoring controls keeps the current camera, style and tour state. Hidden controls are inert so keyboard focus cannot reach them. Labels follow the viewer's Arabic, English or Chinese language. The loading screen remains visible if the scene has not finished loading.

## Installable website

The PWA covers the whole website with one app identity and root scope. The selected website language sets the homepage launch URL; launching the app does not load the villa until the user chooses its entry. The existing favicon supplies the 192px/512px icons, maskable icon and iOS touch icon. The header and footer offer installation, with Safari instructions when a native install prompt is unavailable. The header remains at the top across responsive breakpoints and gains a readable background after scrolling.

The worker prepares the five language homepages, their compiled JS/CSS and the small offline screen. It saves subsequently visited public pages without query strings, up to 64 cache entries. API requests, account/order/checkout pages, writes and private/no-store responses are not cached. Models, HDR textures, videos and other large scene resources stay network-only: this is not an offline copy of the 3D villa, and an offline new visit shows a retry screen. Website imagery may be unavailable offline.

`scripts/prepare-pwa.mjs` stamps a content-based cache version into the built worker. A new worker waits until the user chooses the update button; it does not reload an active tour automatically. Deploy the complete `dist` directory with the existing `npm run build` command. Changes on the feature branch require merging before the production branch automatically deploys.

The model is a PDF-based prototype of the C end mirror unit, with reconstructed surroundings and proposed furniture. It is not a site-verified construction model. AI generation, paid delivery and cloud editing are outside this first entry.
