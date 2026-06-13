# SEO & Accessibility (a11y) Rules

This ruleset governs semantic document structures, title/meta tag updates, and accessibility integrations to ensure excellent indexing and keyboard/screen-reader compatibility.

---

## 🔍 SEO & Semantic HTML
- **Dynamic SEO Metadata**: Update document headers dynamically (e.g. `document.title`, description tags, and Open Graph tags) on page transitions using `react-helmet-async` (or the routing framework's metadata controller).
- **Semantic Structure**: Do not use `<div>` tags for all layouts. Utilize HTML5 semantic elements to establish logical document outline sections:
  - `<header>`: Site or section navigation header.
  - `<nav>`: Core navigation links.
  - `<main>`: Singular primary content of the body.
  - `<section>`: Generic thematic block.
  - `<article>`: Self-contained composition (posts, articles, cards).
  - `<footer>`: Copyright, contact, and structural footers.
- **Heading Hierarchy**: Align heading tags (`<h1>` to `<h6>`) logically. Ensure there is only one `<h1>` per page, and header levels are nested sequentially.

---

## ♿ Accessibility (a11y) Standards
- **Image alt attributes**:
  - All `<img>` tags must have an `alt` attribute.
  - Provide short, descriptive descriptions for informative images.
  - For decorative images, write `alt=""` so that screen readers skip reading their filenames aloud.
- **Icon-Only Controls**: Every button, link, or clickable component that wraps only an icon (e.g. SVG close button `X`, favorite button heart, menu hamburger icon) must include a descriptive `aria-label` or `aria-labelledby` attribute.
- **Visual Keyboard Focus**: Do not strip or disable the browser's default blue focus rings without adding an alternative visual indicator. All interactive inputs, buttons, and links must display a prominent border ring when navigated via keyboard:
  ```css
  /* Example utility or class selector */
  .focus-indicator:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-offset), 0 0 0 4px var(--color-primary);
  }
  ```
  In Tailwind: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`.
