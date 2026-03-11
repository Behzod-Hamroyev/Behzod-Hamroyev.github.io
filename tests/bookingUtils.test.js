import assert from 'node:assert/strict';
import test from 'node:test';
import { deepClone, nowStamp, roomStats } from '../src/utils/bookingUtils.js';

function createRoom(seats) {
  return { id: 'r1', name: 'Test Room', seats };
}

test('roomStats counts seats by their status', () => {
  const room = createRoom([
    { id: 's1', status: 'available' },
    { id: 's2', status: 'available' },
    { id: 's3', status: 'reserved' },
    { id: 's4', status: 'occupied' }
  ]);
  const stats = roomStats(room, []);
  assert.equal(stats.available, 2);
  assert.equal(stats.reserved, 1);
  assert.equal(stats.occupied, 1);
  assert.equal(stats.selected, 0);
});

test('roomStats counts selected seats as selected, not their original status', () => {
  const room = createRoom([
    { id: 's1', status: 'available' },
    { id: 's2', status: 'available' },
    { id: 's3', status: 'available' }
  ]);
  const stats = roomStats(room, ['s1', 's2']);
  assert.equal(stats.selected, 2);
  assert.equal(stats.available, 1);
});

test('deepClone produces an equal but independent copy', () => {
  const original = { a: 1, b: { c: [2, 3] } };
  const clone = deepClone(original);
  assert.deepEqual(clone, original);
  clone.b.c.push(4);
  assert.deepEqual(original.b.c, [2, 3]);
});

test('nowStamp returns a non-empty string', () => {
  const stamp = nowStamp();
  assert.equal(typeof stamp, 'string');
  assert.ok(stamp.length > 0);
});
