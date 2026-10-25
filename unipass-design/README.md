# UniPass design package (from Figma "All" page)
Start with **DESIGN_SPEC.md** (screens, tokens, components, forms, routes, gaps). Then:
- `screens/` visual targets (1440 desktop renders)
- `context/localized/` reference React/Tailwind code with local asset paths (`context/` = raw responses with temporary Figma URLs)
- `metadata/text-content-by-screen.md` exact copy with positions
- `tokens.json`, `ASSET_MAP.md`, `assets/`
Public URL prefix used in localized code: `/assets/figma/...`. Copy `assets/` into Next.js `public/` to resolve it as-is.
