# CLAUDE.md — Certified Roofing Website

## Project Overview

Static marketing website for **Certified Roofing** (Farmington, NM) with an integrated CRM dashboard powered by Pipedrive. No build tools, no frameworks — vanilla HTML, CSS, and JavaScript served directly to the browser.

## File Structure

```
├── index.html        # Main marketing site (single-page scroll layout)
├── prospects.html    # CRM dashboard for managing roofing prospects
├── script.js         # Marketing page interactivity (menu, animations, form)
├── prospects.js      # Pipedrive CRM integration (API calls, import/export)
├── styles.css        # Global styles and design system
├── prospects.css     # Dashboard-specific styles
```

There are only 6 source files. No `package.json`, no bundler, no preprocessors.

## Tech Stack

- **HTML5** — Semantic markup, no templating
- **CSS3** — Custom properties, media queries, mobile-first responsive design
- **Vanilla JavaScript** — No frameworks or libraries (except SheetJS for XLSX)
- **Pipedrive REST API** — CRM integration for prospect management
- **Google Fonts** — Playfair Display (headings), Inter (body)

## Development

### Running Locally

Open `index.html` in a browser, or use any static file server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

### No Build Step

There is no build, transpile, or bundle step. Edit files and refresh the browser.

### No Tests

There is no test suite. Verify changes manually in the browser.

## Design System

### Colors (CSS custom properties in `:root`)

| Token             | Value     | Usage                    |
|-------------------|-----------|--------------------------|
| `--navy`          | `#1B2A4A` | Primary brand / backgrounds |
| `--navy-dark`     | `#111D33` | Darker variant           |
| `--navy-light`    | `#2A3F6B` | Lighter variant          |
| `--gold`          | `#C8A951` | Accent / CTAs            |
| `--gold-light`    | `#D4BC72` | Hover states             |
| `--gold-dark`     | `#A8893A` | Active states            |

### Typography

- **Headings:** `'Playfair Display', serif`
- **Body:** `'Inter', sans-serif`

### Responsive Breakpoints

- `768px` — Tablet
- `1024px` — Desktop
- `1280px` — Large desktop

Mobile-first: base styles target small screens, `min-width` media queries add larger layouts.

### Component Patterns

- **Buttons:** `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-block`
- **Cards:** `.service-card`, `.stat-card`, `.testimonial-card`
- **Layout:** `.container` (max-width 1200px), `.section` (vertical padding)
- **Naming:** BEM-adjacent (`.nav__inner`, `.service-card__icon`)
- **State classes:** `.is-open`, `.is-active`, `.is-visible`, `.no-scroll`
- **Modals:** Use `hidden` attribute (not CSS classes) for visibility

## Code Conventions

### JavaScript

- Modular `init*()` functions called on `DOMContentLoaded`
- `camelCase` for functions and variables
- `async/await` for API calls with `try/catch` error handling
- Guard clauses with early returns for missing DOM elements
- Section comments: `/* ===== NAME ===== */`
- No global state except in `prospects.js` (which tracks `allDeals`, `allStages`)

### HTML

- Semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<form>`)
- `data-*` attributes for JS hooks (`data-animate`, `data-target`, `data-field`)
- Inline SVG icons
- Section `id` attributes for anchor navigation (`#services`, `#about`, `#contact`)
- ARIA attributes on interactive elements (`aria-label`, `aria-expanded`)

### CSS

- All colors and key values defined as CSS custom properties
- Mobile-first with `min-width` media queries
- No nesting, no preprocessors — plain CSS

## Architecture Notes

### Page Routing

This is a static multi-page site:
- `index.html` — Single-page scroll with anchor links (`#hero`, `#services`, `#about`, `#testimonials`, `#contact`)
- `prospects.html` — Separate dashboard page linked from the nav

### Pipedrive Integration (`prospects.js`)

- API base: `https://boost-housellc.pipedrive.com/api/v1`
- Auth via API token in request headers
- Key operations: load deals, create persons/deals/notes, import from XLSX, export to XLSX
- Pagination handled via `pipedriveAPIAll()` (100 items/page)

### Contact Form (`script.js`)

- Client-side validation only (name, phone, email, service)
- **No backend submission** — form shows success message but doesn't send data anywhere
- Comments indicate future integration with Formspree, Netlify Forms, or EmailJS

## Known Issues

1. **Hardcoded API token** — Pipedrive API key is exposed in `prospects.js`. Should be proxied through a backend.
2. **No form backend** — Contact form submissions are not sent anywhere.
3. **No minification** — CSS/JS served unminified with no optimization.
4. **Table overflow** — Prospects table may overflow on very small screens.

## AI Assistant Guidelines

- Do not introduce build tools, frameworks, or package managers unless explicitly asked.
- Keep changes minimal — this is a simple static site; do not over-engineer.
- Preserve the existing design system (CSS variables, component classes, responsive breakpoints).
- When adding new pages, follow the existing pattern: shared `styles.css` + page-specific CSS file, separate JS file.
- Escape user-facing content to prevent XSS (the codebase already does this in `prospects.js`).
- Do not commit `.env` files or API tokens. Flag any hardcoded secrets found.
