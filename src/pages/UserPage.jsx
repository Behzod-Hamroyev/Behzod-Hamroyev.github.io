import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookingPanel from '../components/BookingPanel';
import FiltersBar from '../components/FiltersBar';
import Legend from '../components/Legend';
import SeatMap from '../components/SeatMap';
import SidebarNav from '../components/SidebarNav';
import { useBooking } from '../state/BookingContext';
import { roomStats } from '../utils/bookingUtils';

export default function UserPage({ hideLibrarySidebar = false, readOnly = false, librarianOverride = false }) {
  const { state, current, actions } = useBooking();

  const [featureFilter, setFeatureFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stage, setStage] = useState('select');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [librarianSelectedSeatIds, setLibrarianSelectedSeatIds] = useState([]);
  const prevReservationsCountRef = useRef(0);
  const dialogTriggerRef = useRef(null);
  const dialogConfirmBtnRef = useRef(null);

  const floors = current.library?.floors || [];
  const rooms = current.floor?.rooms || [];
  const activeSelectedSeatIds = librarianOverride ? librarianSelectedSeatIds : state.selection.seatIds;

  useEffect(() => {
    setStage('select');
    setShowConfirmDialog(false);
    setLibrarianSelectedSeatIds([]);
  }, [state.selection.libraryId, state.selection.floorId, state.selection.roomId]);

  const selectedSeats = useMemo(() => {
    if (!current.room) return [];
    return current.room.seats
      .filter((seat) => activeSelectedSeatIds.includes(seat.id))
      .map((seat) => seat.code);
  }, [activeSelectedSeatIds, current.room]);

  useEffect(() => {
    if (!selectedSeats.length && stage === 'review') {
      setStage('select');
    }
  }, [selectedSeats.length, stage]);

  const stats = current.room
    ? roomStats(current.room, activeSelectedSeatIds)
    : { available: 0, selected: 0, reserved: 0, occupied: 0 };

  const featureCounts = useMemo(() => {
    const seats = current.room?.seats || [];
    return {
      powerOutlet: seats.filter((seat) => seat.features.powerOutlet).length,
      nearWindow: seats.filter((seat) => seat.features.nearWindow).length,
      accessible: seats.filter((seat) => seat.features.accessible).length
    };
  }, [current.room]);

  const isSeatMuted = (seat, viewStatus) => {
    if (statusFilter !== 'all' && viewStatus !== statusFilter) {
      return true;
    }

    if (featureFilter === 'powerOutlet' && !seat.features.powerOutlet) {
      return true;
    }

    if (featureFilter === 'nearWindow' && !seat.features.nearWindow) {
      return true;
    }

    if (featureFilter === 'accessible' && !seat.features.accessible) {
      return true;
    }

    return false;
  };

  const handleStartReview = () => {
    if (!selectedSeats.length) {
      actions.setInfo({ error: 'Please choose at least one seat first.', message: '' });
      return;
    }
    setStage('review');
    actions.setInfo({ error: '', message: '' });
  };

  const handleConfirmReservation = () => {
    prevReservationsCountRef.current = Array.isArray(state.reservations) ? state.reservations.length : 0;
    actions.confirmReservation('Guest User');
    closeConfirmDialog();
    setPendingConfirm(true);
  };

  useEffect(() => {
    if (!pendingConfirm) return;
    const currentCount = Array.isArray(state.reservations) ? state.reservations.length : 0;
    if (currentCount > prevReservationsCountRef.current) {
      setStage('confirmed');
      setPendingConfirm(false);
    } else if (state.ui.error) {
      setPendingConfirm(false);
    }
  }, [pendingConfirm, state.reservations, state.ui.error]);

  const openConfirmDialog = () => {
    dialogTriggerRef.current = document.activeElement;
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    requestAnimationFrame(() => {
      dialogTriggerRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!showConfirmDialog) return;
    dialogConfirmBtnRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeConfirmDialog();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfirmDialog]);

  const handleSeatToggle = (seatId) => {
    if (!librarianOverride) {
      actions.toggleSeat(seatId);
      return;
    }

    setLibrarianSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((item) => item !== seatId) : [...prev, seatId]
    );
  };

  const handleLibrarianStatusUpdate = (status) => {
    if (!librarianSelectedSeatIds.length) {
      actions.setInfo({ error: 'Select at least one seat to update status.', message: '' });
      return;
    }

    actions.setSeatsStatus(librarianSelectedSeatIds, status);
    setLibrarianSelectedSeatIds([]);
  };

  return (
    <>
      <div className={`page-grid ${hideLibrarySidebar ? 'no-sidebar' : ''} ${readOnly ? 'no-panel' : ''}`}>
        {!hideLibrarySidebar ? (
          <SidebarNav
            libraries={state.libraries}
            currentLibraryId={state.selection.libraryId}
            onSwitch={actions.switchLibrary}
          />
        ) : null}

        <main className="main-content">
          <section className="page-heading">
            <h1>{current.library?.name || 'Library'} Seating</h1>
            <p>
              {current.library?.location} • Open: {current.library?.openingHours}
            </p>
          </section>

          <section className="kpi-row">
            <article className="kpi-card">
              <span>Total Seats</span>
              <strong>{current.room?.seats.length || 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Available</span>
              <strong>{stats.available}</strong>
              {current.room ? (
                <div
                  className="kpi-progress"
                  role="progressbar"
                  aria-valuenow={stats.available}
                  aria-valuemin={0}
                  aria-valuemax={current.room.seats.length}
                  aria-label={`${stats.available} of ${current.room.seats.length} seats available`}
                >
                  <div
                    className="kpi-progress-fill"
                    style={{ width: `${current.room.seats.length ? Math.round((stats.available / current.room.seats.length) * 100) : 0}%` }}
                  />
                </div>
              ) : null}
            </article>
            <article className="kpi-card">
              <span>Selected</span>
              <strong>{stats.selected}</strong>
            </article>
          </section>

          <FiltersBar
            floors={floors}
            rooms={rooms}
            floorId={state.selection.floorId}
            roomId={state.selection.roomId}
            onFloorChange={actions.switchFloor}
            onRoomChange={actions.switchRoom}
          />

          <section className="filters-bar seat-tools">
            <label>
              Feature
              <select value={featureFilter} onChange={(event) => setFeatureFilter(event.target.value)}>
                <option value="all">All seats</option>
                <option value="powerOutlet">With power outlet ({featureCounts.powerOutlet})</option>
                <option value="nearWindow">Near window ({featureCounts.nearWindow})</option>
                <option value="accessible">Accessible ({featureCounts.accessible})</option>
              </select>
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="selected">Selected</option>
                <option value="reserved">Reserved</option>
                <option value="occupied">Occupied</option>
              </select>
            </label>
          </section>

          <Legend
            counts={stats}
            activeStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <SeatMap
            room={current.room}
            selectedSeatIds={activeSelectedSeatIds}
            onToggle={handleSeatToggle}
            isSeatMuted={isSeatMuted}
            readOnly={readOnly}
            allowBlockedSelection={librarianOverride}
          />
        </main>

        {librarianOverride ? (
          <aside className="booking-panel" aria-live="polite">
            <div className="booking-head">
              <h3>Seat Updates</h3>
              <span className="stage-chip stage-review">LIBRARIAN</span>
            </div>
            <p className="meta">Room: {current.room?.name || '-'}</p>
            <p className="meta">Selected seats: {selectedSeats.length}</p>

            <div className="selected-list">
              <strong>Selected Seats</strong>
              <p>{selectedSeats.length ? selectedSeats.join(', ') : 'None selected'}</p>
            </div>

            {state.ui.error ? <p className="alert error">{state.ui.error}</p> : null}
            {state.ui.message ? <p className="alert success">{state.ui.message}</p> : null}

            <div className="panel-actions">
              <button type="button" className="btn light" onClick={() => setLibrarianSelectedSeatIds([])}>
                Clear Selection
              </button>
              <button type="button" className="btn" onClick={() => handleLibrarianStatusUpdate('available')}>
                Set as Available
              </button>
              <button type="button" className="btn" onClick={() => handleLibrarianStatusUpdate('reserved')}>
                Set as Reserved
              </button>
              <button type="button" className="btn" onClick={() => handleLibrarianStatusUpdate('occupied')}>
                Set as Occupied
              </button>
            </div>
          </aside>
        ) : null}

        {!readOnly && !librarianOverride ? (
          <BookingPanel
            room={current.room}
            selectedSeats={selectedSeats}
            stats={stats}
            error={state.ui.error}
            message={state.ui.message}
            stage={stage}
            onCancel={actions.cancelSelection}
            onStartReview={handleStartReview}
            onBackToSelect={() => setStage('select')}
            onConfirm={openConfirmDialog}
            onStartOver={() => {
              setStage('select');
              actions.setInfo({ error: '', message: 'Ready for a new reservation.' });
            }}
          />
        ) : null}
      </div>

      {showConfirmDialog && !readOnly && !librarianOverride ? (
        <div className="dialog-backdrop" role="presentation">
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h3 id="confirm-title">Confirm Reservation</h3>
            <p>
              You are reserving: <strong>{selectedSeats.join(', ')}</strong>
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn light" onClick={closeConfirmDialog}>
                Back
              </button>
              <button type="button" className="btn" ref={dialogConfirmBtnRef} onClick={handleConfirmReservation}>
                Confirm Booking
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
