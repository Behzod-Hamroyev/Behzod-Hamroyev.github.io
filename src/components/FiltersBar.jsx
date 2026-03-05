import React from 'react';

export default function FiltersBar({ floors, rooms, floorId, roomId, onFloorChange, onRoomChange }) {
  return (
    <div className="filters-bar">
      <label>
        Floor
        <select value={floorId} onChange={(event) => onFloorChange(event.target.value)}>
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {floor.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Room
        <select value={roomId} onChange={(event) => onRoomChange(event.target.value)}>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.type})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
