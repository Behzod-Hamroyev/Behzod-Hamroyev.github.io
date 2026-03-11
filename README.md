# Library Seating Platform

**SE201 Web Programming — Midterm Project** · Live at [behzod.me](https://behzod.me)

A React single-page application for library seat visualization and reservation management.

## Overview

- Users browse libraries, floors, and rooms, then select and reserve seats via an interactive seat map.
- Librarians manage the library structure (add/delete floors and rooms), control seat statuses, and view recent reservations.
- No backend — all state is held in React Context and persisted to browser `localStorage`.

## Features

| Area | Details |
|---|---|
| Seat map | Color-coded grid: available, selected, reserved, occupied |
| Booking flow | Select seats → confirm → reservation recorded |
| Validation | Capacity limits, status guards, confirmation step |
| Librarian tools | Add/delete floors & rooms, bulk seat status override, reservation log |
| Persistence | Auto-saved to `localStorage` (`library-seating-state-v1`) |
| Responsive | Works on desktop and smaller screens |

## Project Structure

```
src/
  App.jsx                     # Top-level shell and hash-based routing
  main.jsx                    # Entry point, wraps app in ErrorBoundary
  styles.css                  # Global styles and CSS variables
  components/
    BookingPanel.jsx           # Sidebar: filters, selection summary, confirm button
    ErrorBoundary.jsx          # Catches and displays runtime errors gracefully
    FiltersBar.jsx             # Library / floor / room selector dropdowns
    Legend.jsx                 # Seat status color legend
    SeatMap.jsx                # Interactive seat grid
    SidebarNav.jsx             # Librarian tab navigation
  pages/
    WelcomePage.jsx            # Landing page with live seat preview
    LoginPage.jsx              # Role selection (User / Librarian)
    LoginCredentialsPage.jsx   # Sign-in form
    UserPage.jsx               # Main seat booking UI
    LibrarianPage.jsx          # Librarian management UI (Overview, Seat Grid, Manage, Reservations)
  state/
    BookingContext.jsx         # Central state, all actions, localStorage persistence
    bookingState.js            # Pure state-transition functions
  utils/
    bookingUtils.js            # Shared helpers (roomStats, deepClone, nowStamp)
    reservationRules.js        # Seat selection and reservation validation rules
  data/
    seedData.js                # Initial demo dataset loaded on first run
tests/
  bookingStateActions.test.js  # State transition unit tests
  bookingUtils.test.js         # Utility function tests
  reservationRules.test.js     # Validation rule tests
```

## Getting Started

```bash
npm install
npm run dev       # Start dev server at http://localhost:5173
```

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

```bash
npm test          # Run all unit tests (Node built-in runner)
```

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| User | `user` | `user` |
| Librarian | `admin` | `admin` |

> These are hardcoded demo credentials for development purposes only.

## Notes

- To reset all data, clear `library-seating-state-v1` from browser localStorage (DevTools → Application → Local Storage).
- Hash-based routing — no router library required. Routes: `#/welcome`, `#/login`, `#/user`, `#/librarian/:page`

## Deployment (GitHub Pages + Custom Domain)

- Workflow: `.github/workflows/deploy.yml` — runs tests, then builds and deploys on every push to `main`
- Custom domain: `public/CNAME` (set to `behzod.me`)

After pushing to `main`:

1. Open GitHub repo **Settings → Pages**.
2. Set **Source** to `GitHub Actions`.
3. Wait for the `Deploy Vite site to GitHub Pages` workflow to finish.
4. Confirm `https://behzod.me` is attached as custom domain.

DNS configuration on Namecheap:

- `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www` → `behzod-hamroyev.github.io`
