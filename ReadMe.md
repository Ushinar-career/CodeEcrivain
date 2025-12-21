# About

This document is created to guide the users of [CodeÉcrivain](https://ushinar-career.github.io/CodeEcrivain/) on how to navigate and what features it provides.

---

# Overview

 **CodeÉcrivain** is a curated space to introduce myself and my work.

<!-- ![screen-shot of landing page]() -->

**App Structure:**

```
📁 Folder: CodeÉcrivain

├── ReadMe.md
├── assets/
│   ├── audio/
│   │   └── background-music.mp3
│   ├── fonts/
│   │   └── fonts.woff2
│   ├── images/
│   │   ├── clouds_lq.jpg
│   │   ├── earth_logo_hq.png
│   │   ├── earth_logo_lq.png
│   │   ├── favicon.png
│   │   ├── profile_picture_hq.png
│   │   ├── profile_picture_lq.png
│   │   └── stars_lq.jpg
│   └── videos/
│       ├── clouds_hq.mp4
│       └── stars_hq.mp4
├── files/
│   └── abc.pdf
├── index.html
├── spa.html
├── static/
│   ├── content/
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── home.html
│   │   └── projects.html
│   ├── css/
│   │   ├── about.css
│   │   ├── contact.css
│   │   ├── main.css
│   │   ├── projects.css
│   │   └── sidebar.css
│   └── js/
│       ├── about.js
│       ├── contact.js
│       ├── global-cursor.js
│       ├── main.js
│       ├── projects.js
│       └── sidebar.js
```

---

# Features

Designed as a SPA, **CodeÉcrivain** comprises of common and dynamic sections. 

## Site Loading
Site loading logic is initiated by function: `initAppLoader()` in [spa.js](./static/js/spa.js#L4) which displays a global loader till the full app is rendered to preserve initial animations.

## Living Cursor
Cursor is disabled by default and replaced with an animated SVG cursor. On hovering above clickable options the cursor pointer appears else only custom animated cursor is displayed.
SVG Global cursor initiated by function: `initLivingCursor()` in [utils.js](./static/js/utils.js#L4)

## Header Area

- **Top Ribbon Header Video** — Ribbon loop video banner at the top. Poster is displayed first for slow networks. Initial darkmode video is loaded. Video changes when toggled to lightmode. No separate chunking and streaming logic, provided by hosting platforms by default. No js required.

- **Dark/Light Theme Toggle** — Switch between dark and light modes. Icon changes as per current theme. Global color scheme for easy update. Load LightTheme video only after toggling. Theme toggling logic is initiated by function: `initThemeToggle()` in [spa.js](./static/js/spa.js#L72)

- **Background Audio Controls** — Play/Pause buttons for ambient music. Hovering on play button loads the lightmode video. before playing pause button is disabled and after playing play button is disabled.
- **Profile Photo** — Personal avatar for privacy.
- **Information Section** — Initial details.
- **CV Download Icon** — Link to CV.

## Navigation Bar
- **Home** — Landing page.
- **About** — Personal/professional background.
- **Projects** — Showcase portfolio.
- **Contact** — Communication form or details.

## Main Content Section
- Central area for page-specific text, media, and interactive elements.

## Interactive Element
- **Chat Icon** — Quick access to an AI chat.

## Footer Section
- Footer with copyright text.

---

## NEXT STEPS

- Structure as PWA

```
Known Bugs

- [ ] Audio icon not transitioning on hover
```
---