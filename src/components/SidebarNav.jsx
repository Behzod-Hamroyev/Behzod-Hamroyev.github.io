import React from 'react';

export default function SidebarNav({ libraries, currentLibraryId, onSwitch }) {
  return (
    <aside className="sidebar">
      <h2>Libraries</h2>
      <div className="library-list">
        {libraries.map((library) => (
          <button
            key={library.id}
            type="button"
            className={`library-item ${currentLibraryId === library.id ? 'active' : ''}`}
            onClick={() => onSwitch(library.id)}
          >
            <strong>{library.name}</strong>
            <span>{library.location}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
