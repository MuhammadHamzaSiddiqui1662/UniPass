# UniPass — frontend design spec (extracted from Figma)

Source: Figma file `bn8R2OsRb6Oe54NdzQlXER`, page **"All"** (`0:1`) only. Extracted 24 Oct 2026 via the Figma MCP (`get_metadata`, `get_screenshot`, `get_design_context`, `get_variable_defs`).

> **Brand-name heads-up:** every screen in the file is branded **"Köprü"** ("Köprü is Turkish for bridge"), not "UniPass", and uses a Köprü logo mark (navy + teal 8-point star outline). The copy targets students **from Pakistan applying to universities in Türkiye**. Swap the brand name/logo for UniPass as needed. The UniPass logo the brief mentions (`assets/logo.jpeg`) was **not on the box** when this package was built, so it isn't included.

> **Palette heads-up:** the same page also has a separate **"Aura Study Consultancy Palette"** spec board (purple `#453F78` + gold `#D4A72C`, Geist fonts) and two swatch frames in those colors. **None of the five website screens use that palette.** The screens use the navy/red/green/teal tokens in §2. Treat the screens as the source of truth unless the user says otherwise. Both are documented below.

## 0. Package layout

| path | contents |
|---|---|
| `screens/*.png` | Full-frame renders at 1× (the visual target). |
| `context/*.md` | Raw `get_design_context` responses (React + Tailwind reference code with `data-node-id`s). **Contains temporary Figma asset URLs (expire ~7 days); use the localized copies.** |
| `context/localized/*.tsx.md` | The same code with every Figma asset URL rewritten to `/assets/figma/...` local paths. |
| `assets/figma/` | 168 de-duplicated static assets (166 SVG, 2 PNG) referenced by the code. See `ASSET_MAP.md`. |
| `assets/rendered/` | 8 composed PNG renders (hero/intro-band backgrounds, campus placeholders, 2 reference renders). |
| `assets/asset-manifest.json` / `asset-index.json` | Every usage of every asset (context file, node id, ancestors) / parsed size, colors, kind. |
| `metadata/all-page-metadata.xml` | Full node tree of page `0:1` (ids, names, positions, sizes, hidden flags). |
| `metadata/text-content-by-screen.md` | **Every text string per screen, grouped by section, with node id and x/y/size.** Use it for exact copy. |
| `tokens.json` | Machine-readable tokens (colors, fonts, radii, borders, shadows, layout). |
| `ASSET_MAP.md` | Each asset file → kind, size, colors, where it is used. |

**How to read the reference code:** Figma exported these screens as flattened, absolutely-positioned layers (`absolute inset-[%...]`), and every rectangle, card, button, input and chip is an SVG `<img>` ("Vector"). Don't copy that structure. Rebuild it as normal flex/grid layout with CSS backgrounds, borders and radii, using the tokens below. Use the code for exact sizes, colors, fonts and text, and keep the real graphics (icons, illustrations, photos) as files. All frames are **desktop, 1440 px wide**. Content is 1200 px wide at x = 120 (120 px side margins).

---

## 1. Screens on page "All"

| # | Figma frame | node | size | screenshot | role |
|---|---|---|---|---|---|
| 1 | Köprü — Landing Desktop | `52:489` | 1440×5966 | `screens/landing-desktop.png` | Home page |
| 2 | Köprü — Universities | `52:935` | 1440×2484 | `screens/universities.png` | University list with filters |
| 3 | Köprü — University Detail | `52:1655` | 1440×1952 | `screens/university-detail.png` | Single university (Istanbul Technical University example) |
| 4 | Köprü — Guides | `52:2470` | 1440×3396 | `screens/guides.png` | Guides index |
| 5 | Köprü — Scholarships | `52:2910` | 1440×1734 | `screens/scholarships.png` | Scholarships info and eligibility checker |
| – | color-palette ("Aura Study Consultancy Palette") | `2:4` | 1440×1801 | `screens/color-palette.png` | Brand palette spec board (not used by the screens) |
| – | #453F78 (scale 0–10) | `5:84` | 300×750 | `screens/palette-primary-453f78.png` | Generated tint/shade scale |
| – | #D4A72C (scale 0–10) | `5:160` | 300×750 | `screens/palette-accent-d4a72c.png` | Generated tint/shade scale |
| – | Frame 1 / Frame 2 | `80:1842` / `80:1843` | 440×427 | `screens/frame-1.png`, `frame-2.png` | Solid swatches: `#453F78` / `#D4A72C` (no other content) |

There are **no mobile/tablet frames**. Responsive behavior is not specified in the file (see §7).

### Routes the design implies
| route | screen | evidence in file |
|---|---|---|
| `/` | Landing | Nav targets |
| `/universities` | Universities | Nav "Universities" (active state on this screen), "View all universities", footer |
| `/universities/[slug]` | University Detail | Card button layer is named `Explore_button_opens_university_detail_page`. Breadcrumb Home / Universities / Istanbul Technical University |
| `/scholarships` | Scholarships | Nav (active state), footer, "Check scholarship eligibility" CTA |
| `/guides` | Guides | Nav (active state), "View all guides", footer |
| `/guides/[slug]` | **not designed** | Implied by "Read guide" and "Read the complete guide" buttons |
| `/#admission-steps`, `/#faq` (or own pages) | Landing sections | Nav items "Admission steps" and "Questions" have no own screens. They match landing sections `Section_Admission_steps` and `Section_FAQ` |
| `/#book` or `/book` | Landing `Section_Book_consultation` | "Book free consultation" CTA in header, hero, footer and detail page. Only the landing form is designed |
| WhatsApp deep link | external | "WhatsApp", "Message on WhatsApp", "Ask on WhatsApp". No number is in the file |
| Compare / Saved | **not designed** | "Save" and "Compare" buttons on detail; bookmark icon on list cards |

---

## 2. Design tokens

### 2.1 Colors used by the website screens
(Observed in text classes and exported SVG fills/strokes. Names are descriptive labels; Figma has no semantic names for them.)

| token | hex | used for |
|---|---|---|
| ink | `#0E1630` | Headings, primary text, dark labels. Also the **footer background** |
| body | `#55607A` | Paragraphs, secondary text, field labels, placeholders, chevrons |
| navy | `#17307A` | Primary filled buttons (Explore, View all…, Read the complete guide), step circles, active nav text, active tab, Book-consultation and "Ready to apply" section backgrounds, bookmark icon, progress bar |
| cta-red | `#D9342B` | Conversion CTAs: header "Book free consultation", "Check scholarship eligibility", form submit, "Apply filters", detail "Book free consultation" |
| whatsapp-green | `#128C4A` | WhatsApp nav text and icon, "Ask on WhatsApp" and "Message on WhatsApp" buttons |
| teal | `#1BB0AA` | Logo mark (inner star), testimonial quote marks (84 px) |
| teal-light | `#7FE0D8` | Check icons on dark backgrounds (hero, book-consultation) |
| success-text / success-tint | `#0F7B5F` / `#DDF3F1` | "Public" chip, benefit chips (Tuition, Housing…), check icons on light backgrounds, merit-table % values |
| warning-text / warning-tint | `#9A5B00` / `#FFF4DC` | "Merit scholarships" badge, "Sample text" badge |
| surface-tint | `#E7ECF8` | Landing scholarships section background, "100%" stat box, category chips (Applying, Money…), "Private" chip, avatar circles, featured-guide panel, note boxes, filter chip |
| page-bg | `#F4F6FA` | Default page and section background |
| surface | `#FFFFFF` | Cards, header pill, admission-steps section, guides section |
| border | `#D9E0EB` | Card borders (1.2 px), dividers (1 px), city chip outline, pagination outline |
| border-strong | `#B8C2D6` | Inputs/selects/outline buttons (1.5 px), FAQ dividers, dashed step connector |
| footer-text | `#C9D1E8` | Footer links and text, breadcrumb on dark |
| on-dark-muted | `#DCE4FA` | Hero subtitle and bullets, intro-band subtitles, Book-consultation subtitle |
| white | `#FFFFFF` | Text on dark and on buttons. White @70% for outline-button borders on dark |

**Hero/intro-band illustration palette** (Figma variables from `get_variable_defs` on `52:489`, used by the Istanbul skyline): `#0F1838` (Bunting / blue-14), `#141F45` (blue-17), `#1C2B5C` (blue-24), `#2A3A6E` (blue-30), `#3A4A80`@55% (East Bay), `#5B6FA8` (azure-51), `#E59A7B` (orange-69), `#F0AE86` (orange-73), `#FFD9A8`@85% (Navajo White, sun), white @70% / @18% (stars, water lines). Overlay: `linear-gradient(90deg, rgba(8,14,36,.88) 0%, rgba(8,14,36,.55) 50%, rgba(8,14,36,.06) 100%)`. Guides and Scholarships intro bands add a `#17307A`@28% fill.

### 2.2 Unused "Aura" palette board (`2:4`, for reference only)
Primary purple 50→900: `#F4F0FF #E7E1FF #D8CFFF #C4B8FF #A78BFA #453F78 #3A357A #2F2A6A #231F54 #12083A`. Amber: Golden 100 `#FFF7D6`, 300 `#FDE68A`, 500 `#D4A72C`, 700 `#B8860B`. Slate: 50 `#F8FAFC`, 100 `#F1F5F9`, 200 `#E2E8F0`, 400 `#94A3B8`, 600 `#475569`, 700 `#334155`, 800 `#1E293B`, 900 `#0F172A`. Semantic: success `#22C55E`/`#DCFCE7`, warning `#EAB308`/`#FEF9C3`, error `#EF4444`/`#FEE2E2`, info `#3B82F6`/`#DBEAFE`. Fonts: Geist, Geist Mono. The 11-step scales `5:84` (#453F78) and `5:160` (#D4A72C) list each hex in their layer names (see `metadata/all-page-metadata.xml`).

### 2.3 Typography
Two families, both on Google Fonts (SIL OFL, no license purchase needed). Load with `next/font/google`.
- **Bricolage Grotesque Bold (700)**: all headings, prices, logo wordmark, step numbers, footer column titles. Uses `font-variation-settings: "opsz" 14, "wdth" 100` (a variable font with opsz/wdth axes; load the variable version).
- **Hanken Grotesk Regular (400) / Bold (700)**: everything else.
- Letter-spacing is 0 everywhere. Figma reports `line-height: normal`. Each multi-line paragraph is split into one text layer per line. The line pitches measured from those layers are listed below.

| role | family/weight | size / line pitch | color | examples |
|---|---|---|---|---|
| Hero H1 | Bricolage 700 | 64 / 72 | white | "Your degree in Türkiye starts here" |
| Stat | Bricolage 700 | 58 | navy | "100%" |
| CTA-band H2 | Bricolage 700 | 48 / 56 | white | "Talk to an advisor for 20 minutes. It is free." |
| Section H2 | Bricolage 700 | 40 / 46 | ink | "Explore universities in Türkiye", "Five steps…", "Students who made the move", "Guides for studying in Turkey", "Questions students ask most" |
| Intro-band H1 | Bricolage 700 | 38 | white | "Guides for studying in Turkey", "Scholarships for studying in Turkey" |
| Detail H1 | Bricolage 700 | 36 | ink | "Istanbul Technical University" |
| Panel H2 | Bricolage 700 | 32 / 38 | ink | "Scholarships that can cover your studies" |
| H2 (small band) | Bricolage 700 | 30 | white / ink | "Ready to apply to …?", featured guide title |
| Price | Bricolage 700 | 28 | ink | "$1,200" |
| H3 / logo | Bricolage 700 | 26 | ink / white | "Book your free consultation", "All guides", "Merit scholarships by university", "Köprü" |
| H3 detail | Bricolage 700 | 24 | ink | "About …", "Why students choose it" |
| Results count | Bricolage 700 | 22 | ink | "8 universities found" |
| Card title / FAQ question | Bricolage 700 | 20 | ink | University names, guide titles, step titles, FAQ questions, "Key facts" |
| Hero lead | Hanken 400 | 20 / 30 | on-dark-muted | hero subtitle |
| Lead | Hanken 400 | 18 / 28 | body (white on dark) | section subtitles |
| Intro lead | Hanken 400 | 17 | on-dark-muted | intro-band subtitles |
| Quote | Hanken 400 | 17 / 26 | ink | testimonial body |
| Big button | Hanken 700 | 17 | white | "View all universities", "View all guides" |
| Body / nav | Hanken 400 | 16 / 25 | body / ink | paragraphs, nav links, input values |
| Button | Hanken 700 | 16 or 15 | white / ink / navy | most buttons |
| Small body | Hanken 400 | 15 / 23 | body / footer-text | footer links, table cells, captions |
| Meta | Hanken 400 | 14 / 22 | body | "Fields: …", "Levels: …", breadcrumbs |
| Label / chip | Hanken 700 | 13 | body / success / navy / warning | form labels, key-fact labels, chips |
| Small meta | Hanken 400 | 13 | body | "Tuition from", "a year (sample)", "12 min read" |
| Photo caption | Hanken 400 | 12 | white on black@38% | "Campus photo placeholder" |

### 2.4 Spacing and layout
- Desktop frame 1440. Container 1200, x = 120.
- 3-column card grid: 384 px cards, 24 px gutters (x = 120 / 528 / 936). Vertical gap 24 px (rows at y 508 / 992 / 1476 on Universities; guide rows step 424 = 400 + 24).
- Header: floating white pill 1200×64, radius 32, at top 20 px over the hero. Logo at x 156. Nav items 16 px with ~48 px gaps. WhatsApp link with icon. Red pill CTA 226×44.
- Section vertical rhythm on Landing: Hero 716, Universities 922, Scholarships 512, Steps 496, Testimonials 770, Guides 790, Book consultation 700, FAQ 720, Footer 340.
- Intro band on inner pages: 244–246 px tall, header overlaps it.
- Exact offsets for any element come from `metadata/text-content-by-screen.md` / `all-page-metadata.xml` (absolute px) or the inset % in the reference code.

### 2.5 Radii
Chips 26 px tall, fully round (13). Photo caption tag 6. Buttons / inputs / selects 10. Note box 12. Cards 16. Panels (filter bar, key facts, scholarship boxes) 18. Featured guide 20. Book-consultation form card and landing scholarship panel 22. Header pill 32 (fully round). Outline "pill" buttons (hero secondary, "Show 6 more stories", topic tabs, Save/Compare, "Read guide", "Official portal") are fully rounded. Step circles 44 px, avatars 48 px, bookmark button 34 px (white @92%), pagination buttons 36 px.

### 2.6 Borders and shadows
- Card border `1.2px #D9E0EB`. Input/select/outline button `1.5px #B8C2D6`. Outline on dark `1.5px rgba(255,255,255,.7)`. Dividers `1px #D9E0EB`. FAQ dividers `1.5px #B8C2D6`. Step connector 2 px **dashed** `#B8C2D6` (~6 px dash / 6 px gap), 186 px between circles.
- Header pill shadow: two solid offset copies of the pill in `#0E1630` (+7 px @12%, +12 px @10%, **no blur in source**). ≈ `box-shadow: 0 7px 0 rgba(14,22,48,.12), 0 12px 0 rgba(14,22,48,.10)`. On inner pages the pill also has a `1px #D9E0EB` stroke.
- Book-consultation form card: solid offset `#0E1630`@10%, +12 px y. ≈ `box-shadow: 0 12px 0 rgba(14,22,48,.10)`.
- No other shadows. No blur effects in the file.

### 2.7 Breakpoints
None defined. Only 1440 desktop frames exist.

---

## 3. Screens: sections in order

Exact copy for every section is in `metadata/text-content-by-screen.md`. Reference code is in `context/`.

### 3.1 Landing (`52:489`), `context/landing-desktop.md`
1. **Header_floating_pill** `52:638`: logo (mark + "Köprü"), nav Universities · Scholarships · Admission steps · Guides · Questions, WhatsApp link (green icon + text), red "Book free consultation" pill.
2. **Hero** `52:491` (716 px): Istanbul skyline illustration + dark L→R gradient (`assets/rendered/hero-background-landing-1440x716.png`, or layered SVGs `landing--hero--hero-image-placeholder--52-497.svg` + `landing--hero--shared-hero-overlay--52-541.svg`). H1 "Your degree in Türkiye / starts here". Subtitle. Buttons: **"Explore universities"** (white, ink text, 212×52, r10) and **"Book free consultation"** (outline white@70%). Three check bullets in teal-light: Free first consultation · Scholarships explained · Support from application to arrival. A hidden note `52:543` says "Placeholder: replace with a photo", so the skyline is meant to be replaced by a photo.
3. **Section_Universities** `52:561` (bg page-bg): H2 "Explore universities in Türkiye" + lead. 3 **University_card**s. "Showing 3 of 8 universities". Navy **"View all universities"** button 340×54.
4. **Section_Scholarships** `52:654` (bg `#E7ECF8`): white **Scholarship_CTA_panel** (1200×360, r22). Left: H2, lead, success chips Tuition · Housing · Monthly allowance · Health insurance, red **"Check scholarship eligibility"** 320×52. Right: tint box 480×280 with "Up to / 100% / tuition covered by Türkiye Bursları".
5. **Section_Admission_steps** `52:676` (bg white): H2 "Five steps from Pakistan to your first class", lead "You do not have to work out the order alone." Five steps, each with a navy number circle, dashed connector, title, 2-line description and duration chip: Free consultation (Day 1) · Check eligibility (1 to 2 weeks) · Prepare and apply (2 to 6 weeks) · Offer and visa (4 to 8 weeks) · Arrive and settle (First month).
6. **Section_Testimonials** `52:720` (bg page-bg): H2 "Students who made the move", lead (says the stories are samples). 3 **Testimonial_card**s: teal quote mark, "Sample text" warning badge, quote, divider, avatar circle "SN" + "Student name" + "From Lahore, now at ITU" / "From Karachi, now at METU" / "From Islamabad, now at Hacettepe". **Load_more_stories**: "Showing 3 of 9 student stories", progress bar 240×4 (80 px navy filled), outline "+ Show 6 more stories" button 300×52.
7. **Section_Guides** `52:772` (bg white): H2 "Guides for studying in Turkey" + lead. 3 **Guide_card**s. "Showing 3 of 15 guides". Navy "View all guides".
8. **Section_Book_consultation** `52:839` (bg navy `#17307A`): left H2 48 px white, 3 teal-check bullets, outline-on-dark **"Message on WhatsApp instead"**. Right: white form card 560×560 r22 (see §5.1).
9. **Section_FAQ** `52:875` (bg page-bg): left H2 "Questions students ask most", text, green **"Ask on WhatsApp"** 220×48. Right: 800 px accordion with 6 items. The first is open (minus icon) with its answer; the rest are closed (plus icon).
10. **Footer** `52:911` (bg `#0E1630`, 340 px): logo (white wordmark, teal/white mark) + 3-line blurb. Columns **Explore** (Universities, Scholarships, Admission steps), **Help** (Guides, Questions, Book free consultation), **Contact** (WhatsApp, Email, Office address in Pakistan). Divider. Disclaimer "Universities make all admission decisions. We help you prepare a complete application and never promise a place."

### 3.2 Universities (`52:935`), `context/universities__*.md`
`get_design_context` on the whole frame came back sparse, so each child was fetched separately (files numbered in order).
1. Header pill (nav "Universities" active: navy bold).
2. **Universities top visual** `54:2`: 246 px skyline band with no text (`assets/rendered/intro-band-universities-1440x246.png`).
3. **Filter_bar_top** `52:1016`: white panel 1200×96 r18 with 4 selects (label 13 bold + 216×44 select): City "All cities", Field of study "All fields", University type "All types", Level of study "All levels". Red **"Apply filters"** 208×44.
4. Results row: "8 universities found" (Bricolage 22) + sort select "Sort: Tuition, low to high" (264×44). Active filter chip "Engineering ×" (tint chip) + "Clear all" link (navy bold 14).
5. **University grid**: 8 cards in rows of 3/3/2. Each card has a bookmark button (white circle 34 px + navy bookmark icon) at the photo's top right. Cards 6–8 also have a **"Merit scholarships"** warning badge at the photo's top left.
6. **Pagination** `52:1249`: "That is every verified university we currently support. More are added regularly." Prev/next outline circle buttons (chevrons drawn grey/disabled) and active page "1" (navy filled 36 px).
7. Footer.

Card data in the file: ITU (Public, Istanbul, $1,200), METU (Public, Ankara, $1,500), Boğaziçi (Public, Istanbul, $1,800), Hacettepe (Public, Ankara, $800), Ege (Public, Izmir, $700), Bahçeşehir (Private, Istanbul, $8,000, merit), Bilkent (Private, Ankara, $14,000, merit), Koç (Private, Istanbul, $20,000, merit). Each also lists "Fields: …" and "Levels: …". All prices are labeled "a year (sample)".

*Off-canvas content:* `Page_intro_band` `52:937` sits at x = 1763, **outside the visible frame**. It holds an unused intro band (breadcrumb "Home / Universities", H1 "Find your university in Türkiye", "Use the filters below to narrow the list, then press Apply filters.", stat chips "8 universities · 3 cities · Public and private") plus a stray duplicate of the University Detail frame. It doesn't render in the screenshot. Its text is in the metadata if you want an H1 on this page.

### 3.3 University Detail (`52:1655`), `context/university-detail.md`
1. Header pill (Universities active).
2. Breadcrumb "Home / Universities / Istanbul Technical University" (14 px, last item bold ink).
3. **Gallery**: main image 800×480 r16 + 2×2 thumbs 184×232 r12 (gap 16). In the file these are the skyline placeholder art (`Shared background — Main campus image / Campus image 2–5`). The "photo placeholder" labels are hidden.
4. Title row: H1 36 px, chips Public (success) and Istanbul (outline). Outline buttons **Save** (100×44) and **Compare** (108×44) on the right.
5. Left column (≈660 px): four blocks of H3 24 px + placeholder paragraph: About …, Why students choose it, Programs and fields, Campus and student life. The copy itself says "Placeholder paragraph … Replace with real, verified copy".
6. Right **Key_facts_sidebar** `52:1724` (420 wide, r18): "Key facts" with divided rows Type, City, Tuition from, Levels, Fields, Scholarships ("Eligible for Türkiye Bursları"). Below: red **"Book free consultation"** 420×50 and green **"Message on WhatsApp"** 420×50.
7. **Section_Ready_to_apply** `52:1749` (navy band 220 px): "Ready to apply to Istanbul Technical University?", "Talk to an advisor for 20 minutes. It is free.", white **"Book free consultation"** 260×48 and outline-on-dark **"Message on WhatsApp instead"**.
8. Footer.

*Misplaced node:* `Merit_table` `52:3054` (a 4-column table) is parented to this frame at y = −326, so it's off-canvas and invisible. Its content belongs to the Scholarships page (§3.5).

### 3.4 Guides (`52:2470`), `context/guides.md`
1. Header pill (Guides active).
2. **Page_intro_band** (244 px skyline + navy@28%): breadcrumb "Home / Guides", H1 38 px, subtitle.
3. **Search_bar** `52:2529`: 700×60 white r16, overlapping the band's bottom edge. Search icon + placeholder "Search guides, for example “visa”".
4. **Guide_topic_tabs**: All (active, navy fill) · Getting started · Applying · Visa and arrival · Money · Life in Turkey (outline pills).
5. **Featured_guide** `52:2563` (1200×340, tint `#E7ECF8`, r20): left cover placeholder (white line art + "Guide cover placeholder" caption). Right: "Start here" chip, H2 30 "A complete guide for international students in Turkey", description, 4 green-check bullets in 2 columns, navy **"Read the complete guide"** 260×48, "15 min read".
6. "All guides" (H3 26) + "15 guides" count on the right.
7. **15 Guide_cards** (3×5 grid, 384×400): blank cover area with white line-icon art (see gaps), category chip, title (20 px, 2 lines), 2-line description, divider, "N min read" + outline **"Read guide"** button.
8. Footer.

### 3.5 Scholarships (`52:2910`), `context/scholarships.md`
1. Header pill (Scholarships active).
2. Intro band: breadcrumb "Home / Scholarships", H1 "Scholarships for studying in Turkey", 2-line subtitle.
3. Two 588×526 panels (r18):
   - **Scholarship_covers_box**: "What Türkiye Bursları usually covers". 2×3 grid of green check-in-circle icons (40 px `#DDF3F1` circle): Tuition, Housing, Monthly allowance, Health insurance, Turkish language year, Flight ticket. Tint note box "Not eligible? Many private universities reduce tuition…". Outline buttons **"Official portal"** and **"University merit scholarships"**.
   - **Eligibility_box**: "Eligibility criteria" table (Level / Age limit / Minimum marks: Bachelor's 21 or under 70%; Master's 30 or under 75%; PhD 35 or under 75%). "Last checked: [month, year]. Rules change every year." Dashed divider. **"Check yourself"** mini-form (§5.3) with result box "Enter your age and marks to see where you stand."
4. "Merit scholarships by university" (H3 26) + lead. **The table area under it is empty in the frame** (the screenshot shows a blank gap about y 1000–1394). The table that belongs here is `Merit_table` `52:3054`, misplaced in the Detail frame (`context/scholarships__merit-table-offcanvas.md`). Columns: University · City · Scholarship up to · Typical criteria. Rows: Bahçeşehir University / Istanbul / 50% tuition / Top exam scores; Bilkent University / Ankara / 100% tuition / Top marks and interview; Koç University / Istanbul / 75% tuition / Strong marks. Header 13 bold body color, university 16 bold ink, values 15 (the % column is bold success green `#0F7B5F`), 1 px `#D9E0EB` row dividers, 1200 wide. The node couldn't be screenshotted (off-canvas, renders 1×1).
5. Footer.

---

## 4. Reusable components

| component | spec | appears on |
|---|---|---|
| **HeaderPill** | 1200×64 white, r32, offset shadow (§2.6). Logo mark 28 px + "Köprü" Bricolage 26. Nav Hanken 16 ink, active = Hanken 700 navy. WhatsApp: green 22×19 chat icon + bold green text. CTA red pill 226×44, white bold 15 "Book free consultation". | all 5 |
| **Footer** | bg `#0E1630`, 340 px. Logo (wordmark white 26). Blurb 15 / 23 `#C9D1E8`. 3 columns at x 620 / 870 / 1120: title Bricolage 16 white, links Hanken 15 `#C9D1E8`, 30 px pitch. 1 px divider white@15% at 260 px from the footer top (full 1200 width). Disclaimer 14. | all 5 |
| **IntroBand** | 244 px skyline background + gradient + navy@28%, breadcrumb (14 `#C9D1E8`, current item bold white), H1 38 white, subtitle 17 `#DCE4FA`. | Guides, Scholarships (Universities uses a 246 px band with no text) |
| **UniversityCard** | 384×460 white, 1.2 px `#D9E0EB`, r16. Photo 384×190 (top corners rounded) with geometric white line overlay and a "Campus photo placeholder" caption (black@38%, r6). Chips: type (Public = success tint/text; Private = `#E7ECF8`/navy) + city (outline `#D9E0EB`, body 13). Name Bricolage 20. Fields/Levels 14 body. Divider. "Tuition from" 13 + price Bricolage 28 + "a year (sample)" 13. Navy **Explore** button 104×44 r10 → detail page. Optional bookmark (list page) and "Merit scholarships" badge. | Landing, Universities |
| **GuideCard** | 384×400 white card r16. Cover area 384×160 (layer `52:2594` etc.) with white line art. Category chip (`#E7ECF8`, navy bold 13). Title Bricolage 20. Description 15 body. Divider. "N min read" 13 body. Outline pill **Read guide** (1.5 px `#B8C2D6`, ink bold 15). | Landing, Guides |
| **TestimonialCard** | 384×336 white card r16. Teal "“" glyph (Bricolage 84 `#1BB0AA`). "Sample text" badge. Quote 17 / 26 ink. Divider. Avatar 48 `#E7ECF8` with initials (navy bold 15), name bold 16, origin 13 body. | Landing |
| **Chip** | 26 px tall, fully round, Hanken 700 13. Variants: success (`#DDF3F1`/`#0F7B5F`), tint (`#E7ECF8`/`#17307A`), warning (`#FFF4DC`/`#9A5B00`), outline (`1.2px #D9E0EB`, body 400 13). | everywhere |
| **Buttons** | *Primary navy* r10 (Explore 104×44, View all 340×54, Read complete guide 260×48). *Conversion red* `#D9342B` r10 (or pill in header), white bold. *WhatsApp green* `#128C4A` r10. *White on dark* r10, ink text. *Outline* fully round, 1.5 px `#B8C2D6`, ink bold. *Outline on dark* fully round, 1.5 px white@70%, white bold. *Text link* navy bold 14 ("Clear all"). | |
| **Select / Input** | white, 1.5 px `#B8C2D6`, r10, 44–47 px tall, 16 px left padding, value 16 ink (placeholder 16 body), chevron 12×7 `#55607A` 16 px from the right. Label above: Hanken 700 13 body, 8–10 px gap. | Filter bar, sort, consult form, eligibility checker |
| **SearchBar** | 700×60 white, 1.2 px `#D9E0EB`, r16. 18 px magnifier icon `#55607A`. Placeholder 16 body. | Guides |
| **Tabs** | 40 px fully-round pills. Active navy fill + white bold. Inactive 1.5 px `#B8C2D6` outline + ink bold 15. | Guides |
| **Accordion (FAQ)** | 800 wide. 1.5 px `#B8C2D6` divider above each item and after the last. Question Bricolage 20 ink. Plus/minus 12 px, 2.2 px ink stroke, right-aligned. Answer 16 / 26 body, 42 px under the question. | Landing |
| **Stepper** | 44 px navy circles with white Bricolage 20 numbers, 2 px dashed connectors, title Bricolage 20, description 15 body, outline duration chip. | Landing |
| **Progress + LoadMore** | 240×4 track `#D9E0EB` + navy fill (80 px = 3/9), round ends. Outline pill button 300×52 with navy 1.5 px border, navy "+" icon and bold text. | Landing testimonials |
| **Pagination** | 36 px circles: prev/next outline `#D9E0EB` with chevron `#B8C2D6`, current filled navy with white number. | Universities |
| **KeyFacts panel** | 420 wide white r18 card, "Key facts" Bricolage 20, rows label 13 bold body + value 15 ink, 1 px dividers. | Detail |
| **CTA bands** | Navy full-width section with white H2 + white button + outline-on-dark WhatsApp button. | Landing (Book consultation), Detail (Ready to apply) |
| **Logo mark** | 20×20 square outline + 28.3 px rotated square (45°), 2.4 px strokes. Navy `#17307A` + teal `#1BB0AA` on light backgrounds (`guides--header-floating-pill--52-2538.svg`, `…-2539.svg`); white + teal in the footer (`guides--footer--52-2889.svg` + `…-2539.svg`). | Header, footer |

---

## 5. CTAs and lead capture

### 5.1 Book your free consultation (Landing `Section_Book_consultation`, form card `52:853`)
| field | control | label | placeholder / default shown |
|---|---|---|---|
| Full name | text input (488×47) | "Full name" | placeholder "Your full name" |
| WhatsApp number | tel input (488×47) | "WhatsApp number" | placeholder "+92 300 1234567" |
| City in Pakistan | select (236×47, left half) | "City in Pakistan" | "Karachi" |
| Level of study | select (236×47, right half) | "Level of study" | "Bachelor's" |
| Best time to reach you | select (488×47) | "Best time to reach you" | "Evening" |
| **Submit** | red button 488×52 r10 | — | "Book free consultation" |

Only the default value of each select is shown; the other options aren't in the file. There's no email field, consent checkbox, validation, error state or success state in the design. The secondary CTA next to the form is "Message on WhatsApp instead".

### 5.2 University filters (Universities `Filter_bar_top`)
City ("All cities"), Field of study ("All fields"), University type ("All types"), Level of study ("All levels") → **Apply filters** (red). Plus the sort select ("Sort: Tuition, low to high"), removable active-filter chips ("Engineering ×") and "Clear all". Option lists aren't designed. Values seen on cards: cities Istanbul / Ankara / Izmir; types Public / Private; fields Engineering, Architecture, Sciences, Business, Medicine and Health; levels Bachelor's, Master's, PhD.

### 5.3 Scholarship eligibility checker (Scholarships `Eligibility_box` › "Check yourself")
Level (select, "Bachelor's"), Your age (select, "19"), Marks (%) (select, "82") → result box "Enter your age and marks to see where you stand." There's no submit button, so it implies a live result computed against the criteria table (Bachelor's ≤21 & ≥70%, Master's ≤30 & ≥75%, PhD ≤35 & ≥75%). Result states aren't designed.

### 5.4 Guide search (Guides `Search_bar`)
Single text input "Search guides, for example “visa”" plus topic tabs.

### 5.5 Every CTA in the file
| CTA | style | where | implied action |
|---|---|---|---|
| Book free consultation | red pill | header (all pages) | consult form |
| Book free consultation | outline on dark | landing hero | consult form |
| Book free consultation | red | consult-form submit; detail sidebar | submit lead / go to form |
| Book free consultation | white | detail "Ready to apply" band | consult form |
| Book free consultation | footer link | footer Help column | consult form |
| Explore universities | white | hero | /universities |
| View all universities | navy | landing | /universities |
| Explore | navy | every university card | /universities/[slug] |
| Check scholarship eligibility | red | landing scholarships panel | /scholarships (checker) |
| Show 6 more stories | outline navy | landing testimonials | load more |
| View all guides | navy | landing | /guides |
| Read guide | outline | every guide card | /guides/[slug] |
| Read the complete guide | navy | featured guide | /guides/[slug] |
| WhatsApp | green text + icon | header | WhatsApp |
| Message on WhatsApp instead | outline on dark | consult section; detail band | WhatsApp |
| Message on WhatsApp | green | detail sidebar | WhatsApp |
| Ask on WhatsApp | green | FAQ | WhatsApp |
| Apply filters | red | universities filter bar | filter list |
| Save / Compare | outline | detail title row | not designed |
| Bookmark icon | white circle | list cards | save (not designed) |
| Official portal / University merit scholarships | outline | scholarships covers box | external Türkiye Bursları portal / merit table |

---

## 6. Dynamic vs static content

| content | treatment | notes from the file |
|---|---|---|
| Universities (name, type, city, fields, levels, tuition-from, merit flag, photos, about sections, key facts) | **dynamic (CMS/DB)** | 8 universities. Landing shows 3 ("Showing 3 of 8"). Prices say "(sample)". Detail copy is placeholder text. Photos are placeholders |
| Programs | **dynamic**, not separately designed | Only "Fields" and "Levels" strings per university and a "Programs and fields" paragraph on the detail page. There's no program list or program page in the file |
| Guides (title, category, description, read time, cover) | **dynamic** | 15 guides in 5 categories: Getting started, Applying, Visa and arrival, Money, Life in Turkey. One featured guide |
| Testimonials | **dynamic** | 9 total ("Showing 3 of 9"). All are marked "Sample text" with "Student name" placeholders |
| FAQ items | dynamic or static | 6 Q&As. Only the first answer is written |
| Merit scholarships table | **dynamic** | 3 rows (Bahçeşehir, Bilkent, Koç) |
| Türkiye Bursları eligibility criteria | semi-static (yearly) | "Last checked: [month, year]" placeholder |
| Stats/counters | derived | "8 universities found", "15 guides", "Showing X of Y", "Up to 100%" |
| Admission steps, hero, scholarship-cover list, nav, footer, disclaimers | **static** | |
| Contact details | config | WhatsApp number, email and office address are not in the file (footer shows only labels) |

---

## 7. Responsive notes
- Only 1440 px desktop frames exist. There are **no mobile or tablet designs** and no breakpoints, mobile nav or stacked layouts.
- Hints in the structure: 3-column grids (cards), 2-column splits (landing scholarship panel, consult section, FAQ, scholarship boxes, detail main + sidebar), and a horizontal 5-step stepper. All of these need mobile behavior decided by the implementer (e.g. 1 column under ~768 px, hamburger for the header pill).

---

## 8. Asset → usage mapping
Full table: **`ASSET_MAP.md`** (all 168 files plus 8 renders). The key real graphics:

| asset | used for |
|---|---|
| `assets/figma/landing--section-universities--university-card--52-568.png` (768×380) | Campus photo on university cards (landing cards 1 and 3, all 8 cards on Universities) |
| `assets/figma/landing--section-universities--university-card--52-591.png` (768×380) | Campus photo on landing card 2 (METU) |
| `assets/figma/landing--hero--hero-image-placeholder--52-497.svg` (1536×716.8) | Istanbul skyline illustration (hero). The same art is cropped for intro bands and detail gallery (per-screen copies, same name pattern) |
| `assets/figma/landing--hero--shared-hero-overlay--52-541.svg` | Hero L→R dark gradient overlay (also `…--shared-hero-overlay--*` per screen) |
| `assets/rendered/hero-background-landing-1440x716.png` | Composed hero background (skyline + overlay) |
| `assets/rendered/intro-band-{universities,guides,scholarships}-*.png` | Composed intro-band backgrounds |
| `assets/rendered/campus-placeholder-{main,thumb}-*.png` | Detail gallery placeholders |
| `guides--header-floating-pill--52-2538.svg` + `…-2539.svg` | Logo mark (navy square + teal rotated square) |
| `guides--footer--52-2889.svg` + `…-2539.svg` | Footer logo mark (white + teal) |
| `guides--header-floating-pill--52-2546.svg` | WhatsApp chat-bubble icon (green, 24×21) |
| `landing--hero--52-555.svg`, `landing--section-book-consultation--52-844.svg` | Teal-light check icons on dark |
| `guides--featured-guide--52-2579.svg`, `scholarships--scholarship-covers-box--52-2990.svg` (+ `…-2989.svg` 40 px circle) | Green check icons on light |
| `landing--section-book-consultation--52-864.svg` | Select chevron (12×7, `#55607A`). Used by every select |
| `guides--search-bar--52-2531.svg` + `…-2532.svg` | Search magnifier (circle + handle) |
| `universities--misc--vector--52-1066.svg` + `…-1067.svg` | Bookmark button (white circle + navy bookmark) |
| `universities--pagination--52-1251/1252/1253.svg` | Pagination circle outline, chevron, active circle |
| `landing--section-faq--52-886.svg` + `…-893.svg` | FAQ minus / plus strokes (horizontal + vertical bar) |
| `landing--section-testimonials--load-more-stories--52-770/771.svg` | "+" icon on "Show 6 more stories" |
| `landing--section-admission-steps--52-683.svg` | Dashed step connector |
| `landing--section-universities--university-card--52-569/571/…` and `guides--guide-card--52-2595/2597/…` | Geometric white line overlays on card photos / covers |
| `guides--guide-card--52-2599, -2620, -2621, -2661, -2698, -2699, -2837, -2571`, `guides--featured-guide--52-2565/2566/2568/2570` | Line-art cover glyphs on guide covers (white strokes) |

---

## 9. Gaps and caveats (as found in the file)
1. **Brand mismatch:** the screens say "Köprü", not "UniPass". `assets/logo.jpeg` (UniPass logo) was **not present** on the box.
2. **Two conflicting palettes:** the website screens (navy/red/green/teal, Bricolage + Hanken) vs the "Aura" palette board and swatches (purple `#453F78` / gold `#D4A72C`, Geist). Not reconciled in the file.
3. **No mobile/tablet frames**, no breakpoints, no mobile nav.
4. **No hover/focus/disabled/error/success states** and no component variants. The whole file is flattened vectors (no Figma components, no Code Connect, no auto-layout), so the reference code is absolute-positioned.
5. **Universities frame** returned sparse metadata at the top level. It was resolved by fetching all children individually. It also contains off-canvas content (`Page_intro_band` `52:937` at x = 1763, with an unused H1/intro and a duplicate Detail frame).
6. **Scholarships merit table** is missing from its frame (blank area). The table node `52:3054` is misparented into the Detail frame off-canvas, so its code was captured but no screenshot could be made (1×1 render).
7. **Guide card covers look blank**: each card has a 384×160 cover layer (e.g. `52:2594`), but it exports as an *empty* SVG (`guides--featured-guide--52-2565.svg`, no paths, 19 uses), and Figma's own render shows white there too. The white cover line art (30%/18%/100% opacity strokes) is therefore invisible on the white card. On the featured guide the same art sits on `#E7ECF8`. A cover fill/image appears to be missing in the source. The empty `Hero_overlay` `52:542` (top 12% of the hero) is likewise an empty export.
8. **Placeholders:** campus photos (hero note "Placeholder: replace with a photo", "Campus photo placeholder"), detail paragraphs, testimonial names/quotes ("Sample text"), prices "(sample)", "Last checked: [month, year]", 5 of 6 FAQ answers, all select option lists.
9. **Not designed:** guide article page, program list/page, compare/saved views, consult-form confirmation, WhatsApp number/email/office address values.
10. **Fonts:** Bricolage Grotesque, Hanken Grotesk (and Geist on the unused board) are all open-source (OFL), so no licensing purchase is needed. Bricolage uses variable axes (opsz 14, wdth 100).
11. `get_variable_defs` returned only the illustration color variables listed in §2.1. There are no spacing, typography or radius variables in the file, so those tokens were measured from the layers.
12. The composite renders in `assets/rendered/` are 1× only (the screenshot tool won't render above the node's natural size).
