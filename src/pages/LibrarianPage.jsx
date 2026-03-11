import React, { useEffect, useMemo, useState } from 'react';
import { useBooking } from '../state/BookingContext';
import UserPage from './UserPage';

const ROOM_PRESETS = {
  silent: { rows: 4, cols: 6, maxSelectableSeats: 2 },
  group: { rows: 3, cols: 5, maxSelectableSeats: 4 },
  computer: { rows: 4, cols: 5, maxSelectableSeats: 2 },
  exam: { rows: 6, cols: 6, maxSelectableSeats: 1 }
};
const LIBRARIAN_PAGES = ['overview', 'seat-grid', 'manage', 'reservations'];

function librarianPageFromHash(hashValue) {
  if (!hashValue.startsWith('#/librarian')) return 'overview';

  const tail = hashValue.replace('#/librarian', '').replace(/^\//, '');
  if (!tail) return 'overview';
  // support legacy "rooms" hash
  if (tail === 'rooms') return 'manage';
  return LIBRARIAN_PAGES.includes(tail) ? tail : 'overview';
}

export default function LibrarianPage({ selectedLibraryId, onSelectLibrary }) {
  const { state, current, actions } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(librarianPageFromHash(window.location.hash));

  const [floorLabel, setFloorLabel] = useState('');
  const [selectedRoomFloorId, setSelectedRoomFloorId] = useState('');

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

  const roomsForSelectedFloor = useMemo(() => {
    if (!current.library || !selectedRoomFloorId) return [];
    const floor = current.library.floors.find((f) => f.id === selectedRoomFloorId);
    return floor?.rooms || [];
  }, [current.library, selectedRoomFloorId]);

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

  // Reset floor selection when library changes so user must pick explicitly
  useEffect(() => {
    setSelectedRoomFloorId('');
  }, [current.library?.id]);

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

    const validFloor = current.library?.floors.find((f) => f.id === selectedRoomFloorId);
    if (!validFloor) {
      setFormError((prev) => ({
        ...prev,
        room: 'Please select a floor to add the room to.'
      }));
      return;
    }

    actions.addRoom({
      ...roomForm,
      libraryId: selectedLibraryId,
      floorId: selectedRoomFloorId,
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

  const handleDeleteFloor = (floorId, floorLabel) => {
    if (!window.confirm(`Delete "${floorLabel}"? This will permanently remove all rooms and seats inside it.`)) return;
    actions.deleteFloor({ libraryId: selectedLibraryId, floorId });
    if (floorId === selectedRoomFloorId) {
      setSelectedRoomFloorId('');
    }
  };

  const handleDeleteRoom = (floorId, roomId, roomName) => {
    if (!window.confirm(`Delete "${roomName}"? All seats in this room will be permanently removed.`)) return;
    actions.deleteRoom({ libraryId: selectedLibraryId, floorId, roomId });
  };

  const handleCancelReservation = (reservation) => {
    if (!window.confirm(`Cancel the booking for seat(s) ${reservation.seatCodes.join(', ')} by ${reservation.reservedBy}? The seats will be freed up.`)) return;
    actions.cancelReservation(reservation.id);
  };

  if (!selectedLibraryId) {
    return (
      <div className="librarian-page">
        <section className="library-select-screen card">
          <h1>Select Your Library</h1>
          <p>
            Select the library you manage to get started.
          </p>
          <input
            type="search"
            placeholder="Search by name or location…"
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
          aria-current={activePage === 'overview' ? 'page' : undefined}
          className={activePage === 'overview' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          aria-current={activePage === 'seat-grid' ? 'page' : undefined}
          className={activePage === 'seat-grid' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('seat-grid')}
        >
          Seat Grid
        </button>
        <button
          type="button"
          aria-current={activePage === 'manage' ? 'page' : undefined}
          className={activePage === 'manage' ? 'librarian-tab active' : 'librarian-tab'}
          onClick={() => navigateLibrarianPage('manage')}
        >
          Manage
        </button>
        <button
          type="button"
          aria-current={activePage === 'reservations' ? 'page' : undefined}
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
              <span>Reserved Seats</span>
              <strong>{libraryStats.reserved}</strong>
            </article>
            <article className="kpi-card">
              <span>Occupied Seats</span>
              <strong>{libraryStats.occupied}</strong>
            </article>
            <article className="kpi-card">
              <span>Active Bookings</span>
              <strong>{libraryReservations.length}</strong>
            </article>
          </section>

          <section className="card">
            <div className="section-header-row">
              <h3>Recent Bookings</h3>
              {libraryReservations.length > 8 ? (
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => navigateLibrarianPage('reservations')}
                >
                  View all ({libraryReservations.length}) →
                </button>
              ) : null}
            </div>
            <div className="reservation-list">
              {libraryReservations.length ? (
                libraryReservations.slice(0, 8).map((reservation) => (
                  <article key={reservation.id} className="reservation-item">
                    <div className="reservation-item-body">
                      <strong>{reservation.roomName}</strong>
                      <span>{reservation.floorLabel}</span>
                      <span>Seats: {reservation.seatCodes.join(', ')}</span>
                      <span>Reserved by {reservation.reservedBy}</span>
                      <span>{reservation.createdAt}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p>No bookings for this library yet.</p>
              )}
            </div>
          </section>
        </>
      ) : null}

      {activePage === 'seat-grid' ? (
        <section className="card">
          <h3>Seat Map</h3>
          <p className="hint">Select seats on the map, then set their status using the controls below.</p>
          <div className="embedded-user-workspace">
            <UserPage hideLibrarySidebar librarianOverride />
          </div>
        </section>
      ) : null}

      {activePage === 'manage' ? (
        <section className="manage-grid">
          {/* ── Floors block ── */}
          <div className="card">
            <h3>Floors</h3>
            <p className="hint">Managing: {current.library?.name || '-'}</p>

            {current.library?.floors.length ? (
              <ul className="floor-room-list">
                {current.library.floors.map((floor) => (
                  <li key={floor.id} className="floor-room-item">
                    <span className="floor-room-label">
                      {floor.label}
                      <small> — {floor.rooms.length} {floor.rooms.length === 1 ? 'room' : 'rooms'}</small>
                    </span>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => handleDeleteFloor(floor.id, floor.label)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">No floors added yet.</p>
            )}

            <form onSubmit={submitFloor} className="add-form">
              <input
                placeholder="e.g. Ground Floor, Floor 1…"
                value={floorLabel}
                onChange={(event) => {
                  setFloorLabel(event.target.value);
                  if (formError.floor) setFormError((prev) => ({ ...prev, floor: '' }));
                }}
              />
              {formError.floor ? <p className="alert error">{formError.floor}</p> : null}
              <button type="submit" className="btn">Add Floor</button>
            </form>
          </div>

          {/* ── Rooms block ── */}
          <div className="card">
            <h3>Rooms</h3>

            {roomsForSelectedFloor.length ? (
              <ul className="floor-room-list">
                {roomsForSelectedFloor.map((room) => (
                  <li key={room.id} className="floor-room-item">
                    <span className="floor-room-label">
                      {room.name}
                      <small> — {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • {room.seats.length} {room.seats.length === 1 ? 'seat' : 'seats'}</small>
                    </span>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => handleDeleteRoom(selectedRoomFloorId, room.id, room.name)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : selectedRoomFloorId ? (
              <p className="hint">No rooms on this floor yet.</p>
            ) : (
              <p className="hint">Select a floor below to see its rooms.</p>
            )}

            <form onSubmit={submitRoom} className="add-form">
              <label>
                Add to floor
                <select
                  value={selectedRoomFloorId}
                  onChange={(event) => setSelectedRoomFloorId(event.target.value)}
                  disabled={!current.library?.floors.length}
                >
                  <option value="" disabled>Select a floor…</option>
                  {current.library?.floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>{floor.label}</option>
                  ))}
                </select>
              </label>

              <input
                placeholder="e.g. Study Hall, Reading Room…"
                value={roomForm.name}
                disabled={!selectedRoomFloorId}
                onChange={(event) => {
                  setRoomForm((prev) => ({ ...prev, name: event.target.value }));
                  if (formError.room) setFormError((prev) => ({ ...prev, room: '' }));
                }}
              />

              <label>
                Type
                <select
                  value={roomForm.type}
                  disabled={!selectedRoomFloorId}
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
                Seat layout preset
                <select
                  value={roomForm.preset}
                  disabled={!selectedRoomFloorId}
                  onChange={(event) => applyPreset(event.target.value)}
                >
                  <option value="silent">Silent Default</option>
                  <option value="group">Group Default</option>
                  <option value="computer">Computer Default</option>
                  <option value="exam">Exam Hall</option>
                </select>
              </label>

              <label>
                Rows
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={roomForm.rows}
                  disabled={!selectedRoomFloorId}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, rows: event.target.value }))}
                />
              </label>
              <label>
                Columns
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={roomForm.cols}
                  disabled={!selectedRoomFloorId}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, cols: event.target.value }))}
                />
              </label>
              <label>
                Max seats per booking
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={roomForm.maxSelectableSeats}
                  disabled={!selectedRoomFloorId}
                  onChange={(event) =>
                    setRoomForm((prev) => ({ ...prev, maxSelectableSeats: event.target.value }))
                  }
                />
              </label>

              <p className="hint">{roomSeatCount} seat{roomSeatCount === 1 ? '' : 's'} will be created.</p>
              {formError.room ? <p className="alert error">{formError.room}</p> : null}
              <button type="submit" className="btn" disabled={!selectedRoomFloorId}>Add Room</button>
            </form>
          </div>
        </section>
      ) : null}

      {activePage === 'reservations' ? (
        <section className="card">
          <h3>All Bookings</h3>
          <div className="reservation-list">
            {libraryReservations.length ? (
              libraryReservations.map((reservation) => (
                <article key={reservation.id} className="reservation-item">
                  <div className="reservation-item-body">
                    <strong>{reservation.roomName}</strong>
                    <span>{reservation.floorLabel}</span>
                    <span>Seats: {reservation.seatCodes.join(', ')}</span>
                    <span>Reserved by {reservation.reservedBy}</span>
                    <span>{reservation.createdAt}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => handleCancelReservation(reservation)}
                  >
                    Cancel
                  </button>
                </article>
              ))
            ) : (
              <p>No reservations yet.</p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
