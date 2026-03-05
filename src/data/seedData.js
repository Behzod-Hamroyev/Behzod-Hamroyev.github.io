const statusCycle = ['available', 'available', 'available', 'reserved', 'occupied'];

function generateSeats(roomId, rows, cols) {
  const seats = [];
  let index = 0;

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const label = `${String.fromCharCode(64 + row)}${col}`;
      seats.push({
        id: `${roomId}-seat-${label.toLowerCase()}`,
        code: label,
        row,
        col,
        status: statusCycle[index % statusCycle.length],
        features: {
          powerOutlet: col % 2 === 0,
          nearWindow: col === cols,
          accessible: row === 1 && col === 1
        }
      });
      index += 1;
    }
  }

  return seats;
}

export const seedData = {
  libraries: [
    {
      id: 'lib-central',
      name: 'Central Learning Library',
      location: 'City Center',
      openingHours: '08:00 - 22:00',
      floors: [
        {
          id: 'f1',
          label: 'Floor 1',
          rooms: [
            {
              id: 'r101',
              name: 'Silent Hall A',
              type: 'silent',
              maxSelectableSeats: 3,
              rows: 4,
              cols: 6,
              seats: generateSeats('r101', 4, 6)
            },
            {
              id: 'r102',
              name: 'Computer Room',
              type: 'computer',
              maxSelectableSeats: 2,
              rows: 3,
              cols: 5,
              seats: generateSeats('r102', 3, 5)
            }
          ]
        },
        {
          id: 'f2',
          label: 'Floor 2',
          rooms: [
            {
              id: 'r201',
              name: 'Group Study Room',
              type: 'group',
              maxSelectableSeats: 4,
              rows: 3,
              cols: 4,
              seats: generateSeats('r201', 3, 4)
            }
          ]
        }
      ]
    },
    {
      id: 'lib-east',
      name: 'East Campus Library',
      location: 'East District',
      openingHours: '09:00 - 20:00',
      floors: [
        {
          id: 'f1',
          label: 'Floor 1',
          rooms: [
            {
              id: 'r110',
              name: 'Quiet Zone',
              type: 'silent',
              maxSelectableSeats: 2,
              rows: 4,
              cols: 4,
              seats: generateSeats('r110', 4, 4)
            }
          ]
        }
      ]
    }
  ],
  reservations: []
};
