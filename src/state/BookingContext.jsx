import React, { createContext, useContext, useMemo, useState } from 'react';
import { seedData } from '../data/seedData';
import { deepClone, nowStamp } from '../utils/bookingUtils';

const STORAGE_KEY = 'library-seating-state-v1';
const BookingContext = createContext(null);

function createDefaultState() {
  const firstLibrary = seedData.libraries[0];
  const firstFloor = firstLibrary.floors[0];
  const firstRoom = firstFloor.rooms[0];

  return {
    libraries: deepClone(seedData.libraries),
    reservations: deepClone(seedData.reservations),
    selection: {
      libraryId: firstLibrary.id,
      floorId: firstFloor.id,
      roomId: firstRoom.id,
      seatIds: []
    },
    ui: {
      error: '',
      message: ''
    }
  };
}

function isValidStateShape(value) {
  return (
    value &&
    Array.isArray(value.libraries) &&
    Array.isArray(value.reservations) &&
    value.selection &&
    typeof value.selection.libraryId === 'string' &&
    typeof value.selection.floorId === 'string' &&
    typeof value.selection.roomId === 'string' &&
    Array.isArray(value.selection.seatIds) &&
    value.ui &&
    typeof value.ui.error === 'string' &&
    typeof value.ui.message === 'string'
  );
}

function initialState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (isValidStateShape(parsed)) {
        return parsed;
      }
    } catch {
      // Fall back to default state when persisted JSON is corrupted.
    }
  }

  return createDefaultState();
}

function persistState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function createRoomSeats(roomId, rows, cols) {
  return Array.from({ length: rows * cols }).map((_, idx) => {
    const row = Math.floor(idx / cols) + 1;
    const col = (idx % cols) + 1;
    const code = `${String.fromCharCode(64 + row)}${col}`;
    return {
      id: `${roomId}-seat-${code.toLowerCase()}`,
      code,
      row,
      col,
      status: 'available',
      features: { powerOutlet: false, nearWindow: false, accessible: false }
    };
  });
}

function setRoomStatus(libraries, selection, seatIds, targetStatus) {
  return libraries.map((library) => {
    if (library.id !== selection.libraryId) return library;

    return {
      ...library,
      floors: library.floors.map((floor) => {
        if (floor.id !== selection.floorId) return floor;

        return {
          ...floor,
          rooms: floor.rooms.map((room) => {
            if (room.id !== selection.roomId) return room;

            return {
              ...room,
              seats: room.seats.map((seat) =>
                seatIds.includes(seat.id) ? { ...seat, status: targetStatus } : seat
              )
            };
          })
        };
      })
    };
  });
}

function findCurrent(data) {
  const library = data.libraries.find((item) => item.id === data.selection.libraryId);
  const floor = library?.floors.find((item) => item.id === data.selection.floorId);
  const room = floor?.rooms.find((item) => item.id === data.selection.roomId);
  return { library, floor, room };
}

export function BookingProvider({ children }) {
  const [state, setState] = useState(initialState);

  const setInfo = (patch) => {
    setState((prev) => persistState({ ...prev, ui: { ...prev.ui, ...patch } }));
  };

  const switchLibrary = (libraryId) => {
    setState((prev) => {
      const library = prev.libraries.find((item) => item.id === libraryId);
      if (!library) return prev;
      const floor = library.floors[0];
      const room = floor?.rooms?.[0];

      return persistState({
        ...prev,
        selection: {
          libraryId,
          floorId: floor?.id || '',
          roomId: room?.id || '',
          seatIds: []
        },
        ui: { error: '', message: '' }
      });
    });
  };

  const switchFloor = (floorId) => {
    setState((prev) => {
      const { library } = findCurrent(prev);
      const floor = library?.floors.find((item) => item.id === floorId);
      if (!floor) return prev;
      const room = floor.rooms[0];

      return persistState({
        ...prev,
        selection: {
          ...prev.selection,
          floorId,
          roomId: room?.id || '',
          seatIds: []
        },
        ui: { error: '', message: '' }
      });
    });
  };

  const switchRoom = (roomId) => {
    setState((prev) =>
      persistState({
        ...prev,
        selection: { ...prev.selection, roomId, seatIds: [] },
        ui: { error: '', message: '' }
      })
    );
  };

  const toggleSeat = (seatId) => {
    setState((prev) => {
      const { room } = findCurrent(prev);
      if (!room) return prev;

      const seat = room.seats.find((item) => item.id === seatId);
      if (!seat) return prev;

      if (seat.status !== 'available' && !prev.selection.seatIds.includes(seatId)) {
        return persistState({
          ...prev,
          ui: { error: 'This seat is not available for selection.', message: '' }
        });
      }

      const alreadySelected = prev.selection.seatIds.includes(seatId);

      if (!alreadySelected && prev.selection.seatIds.length >= room.maxSelectableSeats) {
        return persistState({
          ...prev,
          ui: {
            error: `You can select at most ${room.maxSelectableSeats} seat(s) in this room.`,
            message: ''
          }
        });
      }

      const seatIds = alreadySelected
        ? prev.selection.seatIds.filter((item) => item !== seatId)
        : [...prev.selection.seatIds, seatId];

      return persistState({
        ...prev,
        selection: { ...prev.selection, seatIds },
        ui: { error: '', message: '' }
      });
    });
  };

  const cancelSelection = () => {
    setState((prev) =>
      persistState({
        ...prev,
        selection: { ...prev.selection, seatIds: [] },
        ui: { error: '', message: 'Selection cleared.' }
      })
    );
  };

  const confirmReservation = (reservedBy) => {
    setState((prev) => {
      const { room, library, floor } = findCurrent(prev);
      if (!room) return prev;

      if (!prev.selection.seatIds.length) {
        return persistState({
          ...prev,
          ui: { error: 'Select at least one seat before confirmation.', message: '' }
        });
      }

      const invalid = prev.selection.seatIds.some((id) => {
        const seat = room.seats.find((item) => item.id === id);
        return !seat || seat.status !== 'available';
      });

      if (invalid) {
        return persistState({
          ...prev,
          ui: { error: 'One or more selected seats are no longer available.', message: '' },
          selection: { ...prev.selection, seatIds: [] }
        });
      }

      const updatedLibraries = setRoomStatus(prev.libraries, prev.selection, prev.selection.seatIds, 'reserved');

      const reservedSeats = room.seats
        .filter((seat) => prev.selection.seatIds.includes(seat.id))
        .map((seat) => seat.code);

      const reservation = {
        id: `res-${Date.now()}`,
        libraryId: library.id,
        libraryName: library.name,
        floorId: floor.id,
        floorLabel: floor.label,
        roomId: room.id,
        roomName: room.name,
        seatIds: [...prev.selection.seatIds],
        seatCodes: reservedSeats,
        reservedBy: reservedBy || 'Guest User',
        createdAt: nowStamp(),
        status: 'reserved'
      };

      return persistState({
        ...prev,
        libraries: updatedLibraries,
        reservations: [reservation, ...prev.reservations],
        selection: { ...prev.selection, seatIds: [] },
        ui: {
          error: '',
          message: `Reservation confirmed for seat(s): ${reservedSeats.join(', ')}.`
        }
      });
    });
  };

  const setSeatStatus = (seatId, status) => {
    setState((prev) => {
      const updatedLibraries = setRoomStatus(prev.libraries, prev.selection, [seatId], status);

      const selection = prev.selection.seatIds.includes(seatId)
        ? {
            ...prev.selection,
            seatIds: prev.selection.seatIds.filter((item) => item !== seatId)
          }
        : prev.selection;

      return persistState({
        ...prev,
        libraries: updatedLibraries,
        selection,
        ui: { error: '', message: `Seat status updated to ${status}.` }
      });
    });
  };

  const addLibrary = ({ name, location, openingHours }) => {
    setState((prev) => {
      const id = `lib-${Date.now()}`;
      const roomId = `r-${Date.now()}`;
      const library = {
        id,
        name,
        location,
        openingHours,
        floors: [
          {
            id: 'f1',
            label: 'Floor 1',
            rooms: [
              {
                id: roomId,
                name: 'Main Room',
                type: 'silent',
                maxSelectableSeats: 2,
                rows: 3,
                cols: 4,
                seats: createRoomSeats(roomId, 3, 4)
              }
            ]
          }
        ]
      };

      return persistState({
        ...prev,
        libraries: [...prev.libraries, library],
        ui: { error: '', message: `Library "${name}" added.` }
      });
    });
  };

  const addFloor = ({ libraryId, label }) => {
    setState((prev) => {
      const updatedLibraries = prev.libraries.map((library) => {
        if (library.id !== libraryId) return library;

        const nextFloorNo = library.floors.length + 1;
        return {
          ...library,
          floors: [
            ...library.floors,
            {
              id: `f${nextFloorNo}`,
              label: label || `Floor ${nextFloorNo}`,
              rooms: []
            }
          ]
        };
      });

      return persistState({
        ...prev,
        libraries: updatedLibraries,
        ui: { error: '', message: 'New floor added.' }
      });
    });
  };

  const addRoom = ({ libraryId, floorId, name, type, rows, cols, maxSelectableSeats }) => {
    setState((prev) => {
      const updatedLibraries = prev.libraries.map((library) => {
        if (library.id !== libraryId) return library;

        return {
          ...library,
          floors: library.floors.map((floor) => {
            if (floor.id !== floorId) return floor;

            const roomId = `r-${Date.now()}`;
            return {
              ...floor,
              rooms: [
                ...floor.rooms,
                {
                  id: roomId,
                  name,
                  type,
                  rows,
                  cols,
                  maxSelectableSeats,
                  seats: createRoomSeats(roomId, rows, cols)
                }
              ]
            };
          })
        };
      });

      return persistState({
        ...prev,
        libraries: updatedLibraries,
        ui: { error: '', message: `Room "${name}" added.` }
      });
    });
  };

  const value = useMemo(() => {
    const current = findCurrent(state);
    return {
      state,
      current,
      actions: {
        switchLibrary,
        switchFloor,
        switchRoom,
        toggleSeat,
        cancelSelection,
        confirmReservation,
        setSeatStatus,
        addLibrary,
        addFloor,
        addRoom,
        setInfo
      }
    };
  }, [state]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBooking must be used inside BookingProvider');
  }
  return ctx;
}
