# Certified Roofing Website

## Project Overview

Static business website for **Certified Roofing**, a roofing company in Farmington, NM. No build tools, no framework — vanilla HTML/CSS/JS served directly.

## Architecture

```
index.html        — Main landing page (hero, services, about, testimonials, contact form)
styles.css        — All styles for the main site (BEM naming, CSS custom properties)
script.js         — Main site JS (mobile menu, scroll animations, counter animation, form validation)
prospects.html    — CRM dashboard page for managing roofing prospects
prospects.css     — Styles specific to the prospects dashboard
prospects.js      — Prospects page JS (Pipedrive API integration, XLSX import/export)
```

## Tech Stack

- **HTML/CSS/JS** — No framework, no bundler, no package manager
- **Fonts** — Google Fonts: Playfair Display (headings), Inter (body)
- **External lib** — SheetJS (XLSX) loaded via CDN on prospects page
- **CRM** — Pipedrive API integration in prospects.js (API key stored client-side)

## Design System

CSS custom properties defined in `:root` in `styles.css`:
- Colors: `--navy` (#1B2A4A), `--gold` (#C8A951), `--off-white` (#F8F7F4)
- Fonts: `--font-heading` (Playfair Display), `--font-body` (Inter)
- Spacing/layout: `--max-width` (1200px), `--nav-height` (70px/80px desktop)
- BEM naming convention: `.block__element--modifier`

## Key Patterns

- **Responsive**: Mobile-first. Breakpoints at 768px (tablet), 1024px (desktop), 1280px (large)
- **Animations**: `[data-animate]` attribute + IntersectionObserver triggers `.is-visible`
- **Nav**: Fixed nav, hamburger menu on mobile, horizontal on desktop (1024px+)
- **Forms**: Client-side validation only; no backend (placeholder for Formspree/Netlify Forms)

## Business Info

- Company: Certified Roofing
- Location: 310 Airport Drive, Farmington, NM
- Phone: (505) 402-6288
- Email: brandon.certifiedroofing@yahoo.com
- Service area: Four Corners region (Farmington, Bloomfield, Aztec, Kirtland, etc.)

## Development Notes

- No build step — edit files directly and open in browser
- No tests — visual testing only
- Contact form shows success UI but does not submit anywhere yet
- Prospects page requires a Pipedrive API key to function
- All assets are inline SVGs — no image files currently
