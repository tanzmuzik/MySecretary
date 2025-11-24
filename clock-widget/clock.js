// Analog Clock Widget Logic

// Get clock hand elements
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const secondHand = document.getElementById('second-hand');
const digitalTime = document.getElementById('digital-time');

// Function to update clock hands
function updateClock() {
  const now = new Date();

  // Get current time
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate degrees for each hand
  // Second hand: 360° / 60 seconds = 6° per second
  const secondDegrees = ((seconds + milliseconds / 1000) * 6);

  // Minute hand: 360° / 60 minutes = 6° per minute
  // Add partial degrees based on seconds
  const minuteDegrees = ((minutes + seconds / 60) * 6);

  // Hour hand: 360° / 12 hours = 30° per hour
  // Add partial degrees based on minutes
  const hourDegrees = ((hours % 12 + minutes / 60) * 30);

  // Apply rotation to hands
  secondHand.style.transform = `rotate(${secondDegrees}deg)`;
  minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;

  // Update digital time display (optional)
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (digitalTime) {
    digitalTime.textContent = timeString;
  }
}

// Initialize clock
updateClock();

// Update clock every 50ms for smooth second hand movement
setInterval(updateClock, 50);

// Theme switching (optional - can be controlled via keyboard)
document.addEventListener('keydown', (event) => {
  if (event.key === 't' || event.key === 'T') {
    document.body.classList.toggle('light-theme');
  } else if (event.key === 'd' || event.key === 'D') {
    document.body.classList.toggle('dark-theme');
  } else if (event.key === 'h' || event.key === 'H') {
    // Toggle digital time display
    if (digitalTime) {
      digitalTime.style.display = digitalTime.style.display === 'none' ? 'block' : 'none';
    }
  }
});

// Double-click to toggle digital time
document.addEventListener('dblclick', () => {
  if (digitalTime) {
    digitalTime.style.display = digitalTime.style.display === 'none' ? 'block' : 'none';
  }
});

// Right-click to toggle theme
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  document.body.classList.toggle('light-theme');
});

// Log initialization
console.log('Analog Clock Widget initialized');
console.log('Keyboard shortcuts:');
console.log('  T: Toggle light theme');
console.log('  D: Toggle dark theme');
console.log('  H: Toggle digital time display');
console.log('  Double-click: Toggle digital time display');
console.log('  Right-click: Toggle theme');
