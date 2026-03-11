import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cancelReservationInState,
  confirmReservationInState,
  toggleSeatInState
} from '../src/state/bookingState.js';

function createBaseState() {
  return {
    libraries: [
      {
        id: 'lib-1',
        name: 'Main Library',
        location: 'Campus',
        openingHours: '08:00 - 22:00',
        floors: [
          {
            id: 'f1',
            label: 'Floor 1',
            rooms: [
              {
                id: 'r1',
                name: 'Silent Room',
                type: 'silent',
                rows: 1,
                cols: 4,
                maxSelectableSeats: 2,
                seats: [
                  {
                    id: 's1',
                    code: 'A1',
                    row: 1,
                    col: 1,
                    status: 'available',
                    features: { powerOutlet: false, nearWindow: false, accessible: false }
                  },
                  {
                    id: 's2',
                    code: 'A2',
                    row: 1,
                    col: 2,
                    status: 'available',
                    features: { powerOutlet: false, nearWindow: false, accessible: false }
                  },
                  {
                    id: 's3',
                    code: 'A3',
                    row: 1,
                    col: 3,
                    status: 'available',
                    features: { powerOutlet: false, nearWindow: false, accessible: false }
                  },
                  {
                    id: 's4',
                    code: 'A4',
                    row: 1,
                    col: 4,
                    status: 'reserved',
                    features: { powerOutlet: false, nearWindow: false, accessible: false }
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    reservations: [],
    selection: {
      libraryId: 'lib-1',
      floorId: 'f1',
      roomId: 'r1',
      seatIds: []
    },
    ui: {
      error: '',
      message: ''
    }
  };
}

test('toggleSeatInState selects and deselects an available seat', () => {
  const base = createBaseState();
  const selected = toggleSeatInState(base, 's1');
  assert.deepEqual(selected.selection.seatIds, ['s1']);
  assert.equal(selected.ui.error, '');

  const deselected = toggleSeatInState(selected, 's1');
  assert.deepEqual(deselected.selection.seatIds, []);
});

test('toggleSeatInState blocks non-available seat selection', () => {
  const base = createBaseState();
  const next = toggleSeatInState(base, 's4');

  assert.deepEqual(next.selection.seatIds, []);
  assert.match(next.ui.error, /not available/);
});

test('toggleSeatInState enforces room max selection count', () => {
  const base = createBaseState();
  const first = toggleSeatInState(base, 's1');
  const second = toggleSeatInState(first, 's2');
  const blocked = toggleSeatInState(second, 's3');

  assert.deepEqual(second.selection.seatIds, ['s1', 's2']);
  assert.deepEqual(blocked.selection.seatIds, ['s1', 's2']);
  assert.match(blocked.ui.error, /at most 2 seat/);
});

test('confirmReservationInState reserves selected seats and records reservation', () => {
  const base = createBaseState();
  const selected = { ...base, selection: { ...base.selection, seatIds: ['s1', 's2'] } };
  const next = confirmReservationInState(selected, 'Alice', () => '2026-03-07 10:00');

  const room = next.libraries[0].floors[0].rooms[0];
  const statuses = room.seats.map((seat) => ({ id: seat.id, status: seat.status }));

  assert.deepEqual(statuses, [
    { id: 's1', status: 'reserved' },
    { id: 's2', status: 'reserved' },
    { id: 's3', status: 'available' },
    { id: 's4', status: 'reserved' }
  ]);
  assert.equal(next.selection.seatIds.length, 0);
  assert.equal(next.reservations.length, 1);
  assert.equal(next.reservations[0].reservedBy, 'Alice');
  assert.equal(next.reservations[0].createdAt, '2026-03-07 10:00');
  assert.match(next.ui.message, /Reservation confirmed/);
});

test('confirmReservationInState rejects empty selection', () => {
  const base = createBaseState();
  const next = confirmReservationInState(base, 'Alice');

  assert.equal(next.reservations.length, 0);
  assert.match(next.ui.error, /Select at least one seat/);
});

test('confirmReservationInState clears selection when seat becomes unavailable', () => {
  const base = createBaseState();
  const selectedInvalid = { ...base, selection: { ...base.selection, seatIds: ['s1', 's4'] } };
  const next = confirmReservationInState(selectedInvalid, 'Alice');

  assert.equal(next.reservations.length, 0);
  assert.deepEqual(next.selection.seatIds, []);
  assert.match(next.ui.error, /no longer available/);
});

function createStateWithReservation() {
  const base = createBaseState();
  // Mark s1 and s2 as reserved and add a matching reservation record
  const libraries = base.libraries.map((lib) => ({
    ...lib,
    floors: lib.floors.map((floor) => ({
      ...floor,
      rooms: floor.rooms.map((room) => ({
        ...room,
        seats: room.seats.map((seat) =>
          seat.id === 's1' || seat.id === 's2' ? { ...seat, status: 'reserved' } : seat
        )
      }))
    }))
  }));

  return {
    ...base,
    libraries,
    reservations: [
      {
        id: 'res-1',
        libraryId: 'lib-1',
        libraryName: 'Main Library',
        floorId: 'f1',
        floorLabel: 'Floor 1',
        roomId: 'r1',
        roomName: 'Silent Room',
        seatIds: ['s1', 's2'],
        seatCodes: ['A1', 'A2'],
        reservedBy: 'Alice',
        createdAt: '2026-03-07 10:00',
        status: 'reserved'
      }
    ]
  };
}

test('cancelReservationInState removes the reservation', () => {
  const base = createStateWithReservation();
  const next = cancelReservationInState(base, 'res-1');

  assert.equal(next.reservations.length, 0);
});

test('cancelReservationInState frees targeted seats back to available', () => {
  const base = createStateWithReservation();
  const next = cancelReservationInState(base, 'res-1');

  const room = next.libraries[0].floors[0].rooms[0];
  const statuses = room.seats.map((s) => ({ id: s.id, status: s.status }));

  assert.deepEqual(statuses, [
    { id: 's1', status: 'available' },
    { id: 's2', status: 'available' },
    { id: 's3', status: 'available' },
    { id: 's4', status: 'reserved' }
  ]);
  assert.match(next.ui.message, /cancelled/i);
});

test('cancelReservationInState leaves other reservations untouched', () => {
  const base = createStateWithReservation();
  // Add a second reservation for a different seat
  const stateWithTwo = {
    ...base,
    reservations: [
      ...base.reservations,
      {
        id: 'res-2',
        libraryId: 'lib-1',
        libraryName: 'Main Library',
        floorId: 'f1',
        floorLabel: 'Floor 1',
        roomId: 'r1',
        roomName: 'Silent Room',
        seatIds: ['s4'],
        seatCodes: ['A4'],
        reservedBy: 'Bob',
        createdAt: '2026-03-07 11:00',
        status: 'reserved'
      }
    ]
  };

  const next = cancelReservationInState(stateWithTwo, 'res-1');

  assert.equal(next.reservations.length, 1);
  assert.equal(next.reservations[0].id, 'res-2');

  // s4 must remain reserved because it belongs to res-2
  const room = next.libraries[0].floors[0].rooms[0];
  const s4 = room.seats.find((s) => s.id === 's4');
  assert.equal(s4.status, 'reserved');
});

test('cancelReservationInState is a no-op for unknown reservation ID', () => {
  const base = createStateWithReservation();
  const next = cancelReservationInState(base, 'non-existent');

  assert.equal(next, base);
});
