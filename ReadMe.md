# About

This page guides users of [**CodeÉcrivain**](https://ushinar-career.github.io/CodeEcrivain/) on how to navigate the site and explore its features.

# Overview

[**CodeÉcrivain**](https://ushinar-career.github.io/CodeEcrivain/) is a curated space that introduces my work and personal projects.

**App Structure:**

```
📁 Folder: CodeÉcrivain

├── ReadMe.md
├── assets/
│   ├── audio/
│   │   └── background-music.mp3
│   ├── fonts/
│   │   └── fonts_local.woff2
│   ├── images/
│   │   ├── clouds_lq.jpg
│   │   ├── earth_logo_hq.png
│   │   ├── earth_logo_lq.png
│   │   ├── profile_picture_hq.png
│   │   ├── profile_picture_lq.png
│   │   └── stars_lq.jpg
│   └── videos/
│       ├── clouds_hq.mp4
│       └── stars_hq.mp4
├── files/
│   └── resume.pdf
├── help.html
├── index.html
├── spa.html
├── static/
│   ├── content/
│   │   ├── about.html
│   │   ├── chat.html
│   │   ├── contact.html
│   │   ├── home.html
│   │   └── projects.html
│   ├── css/
│   │   ├── about.css
│   │   ├── help.css
│   │   ├── projects.css
│   │   ├── sidebar.css
│   │   └── spa.css
│   └── js/
│       ├── about.js
│       ├── marked.min.js
│       ├── projects.js
│       ├── sidebar.js
│       ├── spa.js
│       └── utils.js

```

# Features

Built as a Single Page Application (SPA), [**CodeÉcrivain**](https://ushinar-career.github.io/CodeEcrivain/) includes both static and dynamic sections.

## Site Loading
The site loading sequence is managed by the function `initAppLoader()` in [spa.js](/static/js/spa.js#L4). It displays a global loader until the application is fully rendered, ensuring smooth initial animations.
> ⚠️ **Warning:** Ensure proper window height for site operation.


## Living Cursor
The default cursor is replaced with an animated SVG cursor. When hovering over clickable elements, the pointer appears; otherwise, only the custom animated cursor is shown.  
This feature is initialized by the function `initLivingCursor()` in [utils.js](/static/js/utils.js#L4).

## Header Area

- **Top Ribbon Header Video** — A looping video banner at the top. A poster image loads first for slower networks. The dark-mode video is shown initially, and switches to the light-mode video when toggled. Streaming is handled by the hosting platform, requiring no additional JavaScript.  
- **Dark/Light Theme Toggle** — Allows switching between dark and light modes. The icon updates according to the current theme. The light-mode video loads only after toggling. Logic is handled by `initThemeToggle()` in [spa.js](/static/js/spa.js#L72).  
- **Background Audio Controls** — Play/Pause buttons control ambient music. When hovering over the play button, the light-mode video loads. The pause button is disabled before playback, and the play button is disabled once playback begins.  
- **Profile Photo** — Displays a personal avatar.  
- **Information Section** — Shows introductory details.  
- **CV Download Icon** — Provides a link to download the CV.  

## Navigation Bar
- **Home** — Landing page.  
- **About** — Personal and professional background.  
- **Projects** — Portfolio showcase.  
- **Contact** — Communication form and details.  

## Main Content Section
The central area displays page-specific text, media, and interactive elements.

## AI Chat Interaction
- **Chat Icon** — Quick access to an AI-powered chat.  

## Footer Section
Contains copyright information.

# Next Steps

- [ ] Add model selection
- [ ] Add LLM change capacity - General & Thinking (Thinking content will appear in real time and accumulate dropdown section above ai response message which can be expanded to view full thought process.)
- [ ] Add copy icon to chat messages
- [ ] Add Projects 

# Known Bugs

- None reported  
