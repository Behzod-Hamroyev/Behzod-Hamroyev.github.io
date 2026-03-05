import React, { useMemo } from 'react';
import BookingPanel from '../components/BookingPanel';
import FiltersBar from '../components/FiltersBar';
import Legend from '../components/Legend';
import SeatMap from '../components/SeatMap';
import SidebarNav from '../components/SidebarNav';
import { useBooking } from '../state/BookingContext';
import { roomStats } from '../utils/bookingUtils';

export default function UserPage() {
  const { state, current, actions } = useBooking();

  const floors = current.library?.floors || [];
  const rooms = current.floor?.rooms || [];

  const selectedSeats = useMemo(() => {
    if (!current.room) return [];
    return current.room.seats
      .filter((seat) => state.selection.seatIds.includes(seat.id))
      .map((seat) => seat.code);
  }, [state.selection.seatIds, current.room]);

  const stats = current.room
    ? roomStats(current.room, state.selection.seatIds)
    : { available: 0, selected: 0, reserved: 0, occupied: 0 };

  return (
    <div className="page-grid">
      <SidebarNav
        libraries={state.libraries}
        currentLibraryId={state.selection.libraryId}
        onSwitch={actions.switchLibrary}
      />

      <main className="main-content">
        <section className="page-heading">
          <h1>{current.library?.name || 'Library'} Seating</h1>
          <p>
            {current.library?.location} • Open: {current.library?.openingHours}
          </p>
        </section>

        <FiltersBar
          floors={floors}
          rooms={rooms}
          floorId={state.selection.floorId}
          roomId={state.selection.roomId}
          onFloorChange={actions.switchFloor}
          onRoomChange={actions.switchRoom}
        />

        <Legend />

        <SeatMap
          room={current.room}
          selectedSeatIds={state.selection.seatIds}
          onToggle={actions.toggleSeat}
        />
      </main>

      <BookingPanel
        room={current.room}
        selectedSeats={selectedSeats}
        stats={stats}
        error={state.ui.error}
        message={state.ui.message}
        onCancel={actions.cancelSelection}
        onConfirm={() => actions.confirmReservation('Guest User')}
      />
    </div>
  );
}
