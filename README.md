# Library Seating Platform (SE201 Midterm)

Frontend React SPA for multi-library seat visualization and reservation management.

## Scope

This project implements a library seating website where:

- Users browse multiple libraries, floors, and rooms.
- Users interact with a visual seat map.
- Users select/deselect seats and confirm reservations.
- Librarians manage libraries/floors/rooms and manually override seat statuses.

No backend is used. Data is persisted in browser `localStorage`.

## Implemented Requirements Mapping

1. Seat visualization:
- Seat grid layout per room.
- Statuses: `available`, `reserved`, `occupied`, `selected`.
- Color-coded legend and live status counters.

2. Seat interaction:
- Click available seats to select.
- Click selected seats to deselect.
- Confirm/cancel reservation actions.
- Real-time updates in the map and side panel.

3. Validation:
- Reserved/occupied seats cannot be selected.
- Room-level max selection limit enforced.
- Confirmation required to finalize booking.
- Clear error/success feedback messages.

4. UI/UX:
- Map-first layout with right booking panel.
- Event-driven updates with React state/context.
- Accessible contrast-oriented palette and clear state labels.

5. Technical:
- React SPA with modular components.
- HTML/CSS/JavaScript based implementation.
- Responsive behavior for smaller screens.

## App Modes

- User View: seat browsing and reservation flow.
- Librarian View: add libraries/floors/rooms, set seat status, inspect recent reservations.

## Project Structure

- `src/App.jsx`: top-level shell and mode switch.
- `src/state/BookingContext.jsx`: central state, persistence, and actions.
- `src/pages/UserPage.jsx`: seat booking UI.
- `src/pages/LibrarianPage.jsx`: librarian management UI.
- `src/components/*`: reusable UI blocks.
- `src/data/seedData.js`: initial demo dataset.
- `src/utils/bookingUtils.js`: helper utilities.

## Run

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
npm run preview
```

## Notes

- Local storage key: `library-seating-state-v1`.
- To reset data, clear local storage in browser devtools.

## Deployment (GitHub Pages + Custom Domain)

- Workflow file: `.github/workflows/deploy.yml`
- Custom domain file: `public/CNAME` (set to `behzod.me`)

After pushing to `main`:

1. Open GitHub repo `Settings` -> `Pages`.
2. Set `Source` to `GitHub Actions`.
3. Wait for the `Deploy Vite site to GitHub Pages` workflow to finish.
4. Confirm `https://behzod.me` is attached as custom domain.

If DNS is not configured yet on Namecheap:

- `A` records for `@` -> `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www` -> `behzod-hamroyev.github.io`
