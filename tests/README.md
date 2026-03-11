# tests/

Unit tests for the library seating application, using Node.js built-in test runner.

## Run

```bash
npm test
```

## Files

| File | Covers |
|------|--------|
| `reservationRules.test.js` | `evaluateSeatToggle`, `buildNextSeatIds`, `canFinalizeReservation` in `src/utils/reservationRules.js` |
| `bookingStateActions.test.js` | `toggleSeatInState`, `confirmReservationInState` in `src/state/bookingState.js` |
| `bookingUtils.test.js` | `roomStats`, `deepClone`, `nowStamp` in `src/utils/bookingUtils.js` |

## Coverage

Business logic and state mutation functions are covered.
React components are not unit-tested here; they can be exercised manually via `npm run dev`.
