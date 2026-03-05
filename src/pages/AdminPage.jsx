import React, { useState } from 'react';
import { useBooking } from '../state/BookingContext';

export default function AdminPage() {
  const { state, current, actions } = useBooking();

  const [libraryForm, setLibraryForm] = useState({
    name: '',
    location: '',
    openingHours: '08:00 - 22:00'
  });

  const [floorLabel, setFloorLabel] = useState('');

  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'silent',
    rows: 4,
    cols: 6,
    maxSelectableSeats: 2
  });

  const submitLibrary = (event) => {
    event.preventDefault();
    if (!libraryForm.name.trim()) return;
    actions.addLibrary(libraryForm);
    setLibraryForm({ name: '', location: '', openingHours: '08:00 - 22:00' });
  };

  const submitFloor = (event) => {
    event.preventDefault();
    actions.addFloor({ libraryId: state.selection.libraryId, label: floorLabel.trim() });
    setFloorLabel('');
  };

  const submitRoom = (event) => {
    event.preventDefault();
    if (!roomForm.name.trim()) return;

    actions.addRoom({
      ...roomForm,
      libraryId: state.selection.libraryId,
      floorId: state.selection.floorId,
      rows: Number(roomForm.rows),
      cols: Number(roomForm.cols),
      maxSelectableSeats: Number(roomForm.maxSelectableSeats)
    });

    setRoomForm({ name: '', type: 'silent', rows: 4, cols: 6, maxSelectableSeats: 2 });
  };

  return (
    <div className="admin-page">
      <h1>Librarian Panel</h1>
      <p>Manage libraries, floors, rooms, and manual seat state overrides.</p>

      <section className="admin-grid">
        <form className="card" onSubmit={submitLibrary}>
          <h3>Add Library</h3>
          <input
            placeholder="Library name"
            value={libraryForm.name}
            onChange={(event) => setLibraryForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            placeholder="Location"
            value={libraryForm.location}
            onChange={(event) => setLibraryForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <input
            placeholder="Opening hours"
            value={libraryForm.openingHours}
            onChange={(event) => setLibraryForm((prev) => ({ ...prev, openingHours: event.target.value }))}
          />
          <button type="submit" className="btn">Add Library</button>
        </form>

        <form className="card" onSubmit={submitFloor}>
          <h3>Add Floor</h3>
          <p className="hint">Current library: {current.library?.name || '-'}</p>
          <input
            placeholder="Floor label (optional)"
            value={floorLabel}
            onChange={(event) => setFloorLabel(event.target.value)}
          />
          <button type="submit" className="btn">Add Floor</button>
        </form>

        <form className="card" onSubmit={submitRoom}>
          <h3>Add Room</h3>
          <input
            placeholder="Room name"
            value={roomForm.name}
            onChange={(event) => setRoomForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            value={roomForm.type}
            onChange={(event) => setRoomForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="silent">Silent</option>
            <option value="group">Group</option>
            <option value="computer">Computer</option>
          </select>
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
            max="10"
            value={roomForm.maxSelectableSeats}
            onChange={(event) =>
              setRoomForm((prev) => ({ ...prev, maxSelectableSeats: event.target.value }))
            }
          />
          <button type="submit" className="btn">Add Room</button>
        </form>
      </section>

      <section className="card">
        <h3>Manual Seat Status Override</h3>
        <p className="hint">Room: {current.room?.name || '-'}</p>
        <div className="seat-override-grid">
          {current.room?.seats.map((seat) => (
            <div key={seat.id} className="override-row">
              <span>{seat.code}</span>
              <select
                value={seat.status}
                onChange={(event) => actions.setSeatStatus(seat.id, event.target.value)}
              >
                <option value="available">available</option>
                <option value="reserved">reserved</option>
                <option value="occupied">occupied</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Recent Reservations</h3>
        <div className="reservation-list">
          {state.reservations.length ? (
            state.reservations.slice(0, 8).map((reservation) => (
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
            <p>No reservations yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
