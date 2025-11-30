# Myndigheter - Svenska Myndigheter Dashboard v2.0

## Overview
Interaktiv dashboard för att visualisera och analysera svenska myndigheter. Visar statistik, geografisk fördelning, departementstillhörighet och historisk utveckling av svenska statliga myndigheter.

**Live site:** https://isakskogstad.github.io/myndigheter/

## Tech Stack
- **Frontend:** React 18.3
- **Build:** Vite 6.0 (migrerad från CRA)
- **Styling:** TailwindCSS 3.4
- **Animations:** Framer Motion 11
- **Maps:** react-simple-maps + d3-geo
- **Charts:** Recharts 2.13
- **Command Palette:** cmdk 1.0
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## Project Structure
```
src/
├── main.jsx              # Vite entry point
├── App.jsx               # Error boundary wrapper
├── MyndigheterApp.jsx    # Main app component
├── components/
│   ├── charts/           # Recharts, SwedenMap
│   ├── layout/           # Layout, Sidebar, Header, BottomNav
│   ├── ui/               # GlassCard, AnimatedNumber, CommandPalette
│   └── views/            # Dashboard, Analysis, Regions, etc.
├── data/                 # Constants, data fetching
├── hooks/                # Custom React hooks
└── styles/
    └── designSystem.js   # Design tokens

.github/workflows/
├── deploy.yml            # Auto-deploy to GitHub Pages
├── claude.yml            # Claude Code integration
└── claude-code-review.yml

backups/                  # Mandatory backup folder
├── session-start/
├── session-end/
└── changes/
```

## Instructions

### Commands
```bash
npm install      # Install dependencies
npm run dev      # Run locally (localhost:5173)
npm run build    # Build for production (dist/)
npm run preview  # Preview production build
```

### Code Style
- Functional components with hooks
- Swedish for UI text, English for code/comments
- Use design tokens from `src/styles/designSystem.js`
- Use GlassCard component for card layouts
- TailwindCSS utility classes for styling

### Git Workflow
- `main` branch triggers automatic deploy to GitHub Pages
- Create feature branches for new work
- Commits to main auto-deploy via GitHub Actions

## Settings
- **Dev server:** http://localhost:5173
- **Production URL:** https://isakskogstad.github.io/myndigheter/
- **Base path:** `/myndigheter/` (configured in vite.config.js)
- **Build output:** `dist/`

## Backup Info
- **Last session backup:** 2025-11-30
- **Backup retention:** Manual cleanup as needed

## Notes
- GitHub Pages deployment uses `dist/` folder (Vite output)
- Large bundle warning is expected (MyndigheterApp contains all agency data)
- TopoJSON for Sweden map loaded from external CDN
- Command Palette opens with Cmd+K (Mac) or Ctrl+K (Windows/Linux)

## Key Features (v2.0)
- Command Palette (Cmd+K) - Quick navigation and search
- Interactive Sweden county map
- Glassmorphism UI design
- Dark mode support
- Animated number transitions
- CSV data export
- Mobile responsive with bottom navigation
