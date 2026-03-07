import React, { useEffect, useMemo, useState } from 'react';
import { useBooking } from '../state/BookingContext';
import UserPage from './UserPage';

const ROOM_PRESETS = {
  silent: { rows: 4, cols: 6, maxSelectableSeats: 2 },
  group: { rows: 3, cols: 5, maxSelectableSeats: 4 },
  computer: { rows: 4, cols: 5, maxSelectableSeats: 2 },
  exam: { rows: 6, cols: 6, maxSelectableSeats: 1 }
};
const LIBRARIAN_PAGES = ['overview', 'seat-grid', 'rooms', 'reservations'];

function librarianPageFromHash(hashValue) {
  if (!hashValue.startsWith('#/librarian')) return 'overview';

  const tail = hashValue.replace('#/librarian', '').replace(/^\//, '');
  if (!tail) return 'overview';
  return LIBRARIAN_PAGES.includes(tail) ? tail : 'overview';
}

export default function LibrarianPage({ selectedLibraryId, onSelectLibrary }) {
  const { state, current, actions } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(librarianPageFromHash(window.location.hash));

  const [floorLabel, setFloorLabel] = useState('');

  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'silent',
    rows: 4,
    cols: 6,
    maxSelectableSeats: 2,
    preset: 'silent'
  });

  const [formError, setFormError] = useState({ floor: '', room: '' });

  const roomSeatCount = useMemo(
    () => Number(roomForm.rows || 0) * Number(roomForm.cols || 0),
    [roomForm.rows, roomForm.cols]
  );

  const filteredLibraries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.libraries.filter((library) => {
      if (!q) return true;
      return (
        library.name.toLowerCase().includes(q) ||
        library.location.toLowerCase().includes(q)
      );
    });
  }, [state.libraries, searchQuery]);

  const libraryReservations = useMemo(
    () => state.reservations.filter((item) => item.libraryId === selectedLibraryId),
    [selectedLibraryId, state.reservations]
  );

  const libraryStats = useMemo(() => {
    if (!current.library) {
      return { floors: 0, rooms: 0, seats: 0, reserved: 0, occupied: 0 };
    }

    const floors = current.library.floors.length;
    const rooms = current.library.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);
    const seats = current.library.floors.reduce(
      (sum, floor) => sum + floor.rooms.reduce((roomSum, room) => roomSum + room.seats.length, 0),
      0
    );
    const reserved = current.library.floors.reduce(
      (sum, floor) =>
        sum +
        floor.rooms.reduce(
          (roomSum, room) =>
            roomSum + room.seats.filter((seat) => seat.status === 'reserved').length,
          0
        ),
      0
    );
    const occupied = current.library.floors.reduce(
      (sum, floor) =>
        sum +
        floor.rooms.reduce(
          (roomSum, room) =>
            roomSum + room.seats.filter((seat) => seat.status === 'occupied').length,
          0
        ),
      0
    );

    return { floors, rooms, seats, reserved, occupied };
  }, [current.library]);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(librarianPageFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (selectedLibraryId && current.library?.id !== selectedLibraryId) {
      actions.switchLibrary(selectedLibraryId);
    }
  }, [actions, current.library?.id, selectedLibraryId]);

  const navigateLibrarianPage = (page) => {
    window.location.hash = `/librarian/${page}`;
  };

  const applyPreset = (presetKey) => {
    const preset = ROOM_PRESETS[presetKey];
    if (!preset) return;
    setRoomForm((prev) => ({ ...prev, preset: presetKey, ...preset }));
  };

  const submitFloor = (event) => {
    event.preventDefault();

    if (!selectedLibraryId) {
      setFormError((prev) => ({ ...prev, floor: 'Please choose your library first.' }));
      return;
    }

    actions.addFloor({ libraryId: selectedLibraryId, label: floorLabel.trim() });
    setFloorLabel('');
    setFormError((prev) => ({ ...prev, floor: '' }));
  };

  const submitRoom = (event) => {
    event.preventDefault();

    if (!roomForm.name.trim()) {
      setFormError((prev) => ({ ...prev, room: 'Please enter a room name.' }));
      return;
    }

    const rows = Number(roomForm.rows);
    const cols = Number(roomForm.cols);
    const maxSelectableSeats = Number(roomForm.maxSelectableSeats);

    if (!rows || !cols || rows < 1 || cols < 1) {
      setFormError((prev) => ({ ...prev, room: 'Rows and columns should be at least 1.' }));
      return;
    }

    if (!maxSelectableSeats || maxSelectableSeats < 1 || maxSelectableSeats > rows * cols) {
      setFormError((prev) => ({
        ...prev,
        room: 'Max selectable seats should be between 1 and total seat count.'
      }));
      return;
    }

    const selectedLibrary = state.libraries.find((lib) => lib.id === selectedLibraryId);
    const validFloor = selectedLibrary?.floors.find((floor) => floor.id === state.selection.floorId);

    if (!validFloor) {
      setFormError((prev) => ({
        ...prev,
        room: 'No valid floor selected. Please add a floor to this library first, then try again.'
      }));
      return;
    }

    actions.addRoom({
      ...roomForm,
      libraryId: selectedLibraryId,
      floorId: state.selection.floorId,
      rows,
      cols,
      maxSelectableSeats
    });

    setRoomForm({
      name: '',
      type: 'silent',
      rows: 4,
      cols: 6,
      maxSelectableSeats: 2,
      preset: 'silent'
    });
    setFormError((prev) => ({ ...prev, room: '' }));
  };

  if (!selectedLibraryId) {
    return (
      <div className="librarian-page">
        <section className="library-select-screen card">
          <h1>Choose Your Library</h1>
          <p>
            You are signed in as a librarian. Pick the library you manage to continue.
          </p>
          <input
            type="search"
            placeholder="Search libraries by name or location"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="library-pick-grid">
            {filteredLibraries.map((library) => {
              const floorCount = library.floors.length;
              const roomCount = library.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);

              return (
                <button
                  key={library.id}
                  type="button"
                  className="library-pick-card"
                  onClick={() => {
                    onSelectLibrary(library.id);
                    actions.switchLibrary(library.id);
                  }}
                >
                  <strong>{library.name}</strong>
                  <span>{library.location}</span>
                  <small>
                    {floorCount} floor(s) • {roomCount} room(s)
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="librarian-page">
      <nav className="librarian-subnav" aria-label="Librarian sections">
        <button
          type="button"
          className={activePage === 'overview' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={activePage === 'seat-grid' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('seat-grid')}
        >
          Seat Grid
        </button>
        <button
          type="button"
          className={activePage === 'rooms' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('rooms')}
        >
          Rooms
        </button>
        <button
          type="button"
          className={activePage === 'reservations' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('reservations')}
        >
          Reservations
        </button>
      </nav>

      {activePage === 'overview' ? (
        <>
          <section className="librarian-overview-grid">
            <article className="kpi-card">
              <span>Floors</span>
              <strong>{libraryStats.floors}</strong>
            </article>
            <article className="kpi-card">
              <span>Rooms</span>
              <strong>{libraryStats.rooms}</strong>
            </article>
            <article className="kpi-card">
              <span>Total Seats</span>
              <strong>{libraryStats.seats}</strong>
            </article>
            <article className="kpi-card">
              <span>Reserved</span>
              <strong>{libraryStats.reserved}</strong>
            </article>
            <article className="kpi-card">
              <span>Occupied</span>
              <strong>{libraryStats.occupied}</strong>
            </article>
            <article className="kpi-card">
              <span>Reservations</span>
              <strong>{libraryReservations.length}</strong>
            </article>
          </section>

          <section className="card">
            <h3>Recent Bookings</h3>
            <div className="reservation-list">
              {libraryReservations.length ? (
                libraryReservations.slice(0, 8).map((reservation) => (
                  <article key={reservation.id} className="reservation-item">
                    <strong>{reservation.libraryName}</strong>
                    <span>
                      {reservation.floorLabel} • {reservation.roomName}
                    </span>
                    <span>Seats: {reservation.seatCodes.join(', ')}</span>
                    <span>By: {reservation.reservedBy}</span>
                    <span>{reservation.createdAt}</span>
                  </article>
                ))
              ) : (
                <p>No bookings yet for this library.</p>
              )}
            </div>
          </section>
        </>
      ) : null}

      {activePage === 'seat-grid' ? (
        <section className="card">
          <h3>Seat Map</h3>
          <p className="hint">Pick seats on the map, then update them as available, reserved, or occupied.</p>
          <div className="embedded-user-workspace">
            <UserPage hideLibrarySidebar librarianOverride />
          </div>
        </section>
      ) : null}

      {activePage === 'rooms' ? (
        <section className="librarian-grid two-col">
          <form className="card" onSubmit={submitFloor}>
            <h3>Add Floor</h3>
            <p className="hint">Library: {current.library?.name || '-'}</p>
            <input
              placeholder="Floor label (optional)"
              value={floorLabel}
              onChange={(event) => setFloorLabel(event.target.value)}
            />
            {formError.floor ? <p className="alert error">{formError.floor}</p> : null}
            <button type="submit" className="btn">Add Floor</button>
          </form>

          <form className="card" onSubmit={submitRoom}>
            <h3>Add Room</h3>
            <input
              placeholder="Room name"
              value={roomForm.name}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, name: event.target.value }))}
            />

            <label>
              Room Type
              <select
                value={roomForm.type}
                onChange={(event) => {
                  const nextType = event.target.value;
                  setRoomForm((prev) => ({ ...prev, type: nextType, preset: nextType }));
                  applyPreset(nextType);
                }}
              >
                <option value="silent">Silent</option>
                <option value="group">Group</option>
                <option value="computer">Computer</option>
              </select>
            </label>

            <label>
              Layout Preset
              <select
                value={roomForm.preset}
                onChange={(event) => applyPreset(event.target.value)}
              >
                <option value="silent">Silent Default</option>
                <option value="group">Group Default</option>
                <option value="computer">Computer Default</option>
                <option value="exam">Exam Hall</option>
              </select>
            </label>

            <input
              type="number"
              min="1"
              max="8"
              value={roomForm.rows}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, rows: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              max="12"
              value={roomForm.cols}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, cols: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              max="50"
              value={roomForm.maxSelectableSeats}
              onChange={(event) =>
                setRoomForm((prev) => ({ ...prev, maxSelectableSeats: event.target.value }))
              }
            />

            <p className="hint">Seat count preview: {roomSeatCount}</p>
            {formError.room ? <p className="alert error">{formError.room}</p> : null}

            <button type="submit" className="btn">Add Room</button>
          </form>
        </section>
      ) : null}

      {activePage === 'reservations' ? (
        <section className="card">
          <h3>Bookings</h3>
          <div className="reservation-list">
            {libraryReservations.length ? (
              libraryReservations.map((reservation) => (
                <article key={reservation.id} className="reservation-item">
                  <strong>{reservation.libraryName}</strong>
                  <span>
                    {reservation.floorLabel} • {reservation.roomName}
                  </span>
                  <span>Seats: {reservation.seatCodes.join(', ')}</span>
                  <span>By: {reservation.reservedBy}</span>
                  <span>{reservation.createdAt}</span>
                </article>
              ))
            ) : (
              <p>No bookings yet for this library.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
