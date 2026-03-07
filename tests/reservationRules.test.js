import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNextSeatIds,
  canFinalizeReservation,
  evaluateSeatToggle
} from '../src/utils/reservationRules.js';

test('evaluateSeatToggle blocks reserved seat when not already selected', () => {
  const result = evaluateSeatToggle({
    seatStatus: 'reserved',
    alreadySelected: false,
    selectedCount: 0,
    maxSelectableSeats: 2
  });

  assert.equal(result.allowed, false);
  assert.match(result.error, /not available/);
});

test('evaluateSeatToggle blocks selection when capacity is reached', () => {
  const result = evaluateSeatToggle({
    seatStatus: 'available',
    alreadySelected: false,
    selectedCount: 2,
    maxSelectableSeats: 2
  });

  assert.equal(result.allowed, false);
  assert.match(result.error, /at most 2 seat/);
});

test('evaluateSeatToggle allows deselection even when at max capacity', () => {
  const result = evaluateSeatToggle({
    seatStatus: 'available',
    alreadySelected: true,
    selectedCount: 2,
    maxSelectableSeats: 2
  });

  assert.equal(result.allowed, true);
});

test('buildNextSeatIds toggles seat in and out of selection', () => {
  const selected = ['s1', 's2'];

  assert.deepEqual(buildNextSeatIds(selected, 's3'), ['s1', 's2', 's3']);
  assert.deepEqual(buildNextSeatIds(selected, 's2'), ['s1']);
});

test('canFinalizeReservation requires at least one selected seat', () => {
  assert.equal(canFinalizeReservation({ selectedSeatIds: [] }), false);
  assert.equal(canFinalizeReservation({ selectedSeatIds: ['s1'] }), true);
});
