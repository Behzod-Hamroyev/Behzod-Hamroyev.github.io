import React, { useMemo, useState } from 'react';

function libraryOccupancy(library) {
  const seats = library.floors.flatMap((floor) => floor.rooms.flatMap((room) => room.seats));
  const total = seats.length;
  const busy = seats.filter((seat) => seat.status === 'reserved' || seat.status === 'occupied').length;
  const percentage = total ? Math.round((busy / total) * 100) : 0;
  return { busy, total, percentage };
}

export default function SidebarNav({ libraries, currentLibraryId, onSwitch }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const visibleLibraries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = libraries.filter((library) => {
      if (!normalized) return true;
      return (
        library.name.toLowerCase().includes(normalized) ||
        library.location.toLowerCase().includes(normalized)
      );
    });

    if (sortBy === 'name-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'occupancy-desc') {
      result = [...result].sort((a, b) => libraryOccupancy(b).percentage - libraryOccupancy(a).percentage);
    }

    return result;
  }, [libraries, query, sortBy]);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Libraries</h2>
        <span className="pill">{libraries.length}</span>
      </div>

      <div className="sidebar-tools">
        <input
          type="search"
          value={query}
          placeholder="Search library..."
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search libraries"
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort libraries">
          <option value="name-asc">Sort: Name</option>
          <option value="occupancy-desc">Sort: Occupancy</option>
        </select>
      </div>

      <div className="library-list">
        {visibleLibraries.map((library) => {
          const occupancy = libraryOccupancy(library);

          return (
            <button
              key={library.id}
              type="button"
              className={`library-item ${currentLibraryId === library.id ? 'active' : ''}`}
              onClick={() => onSwitch(library.id)}
            >
              <div className="library-title-row">
                <strong>{library.name}</strong>
                <span className="occupancy-badge">{occupancy.percentage}% busy</span>
              </div>
              <span>{library.location}</span>
              <small>
                {occupancy.busy}/{occupancy.total} busy seats
              </small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
