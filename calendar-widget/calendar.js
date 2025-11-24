// Monthly Calendar Widget Logic

let currentDate = new Date();
let selectedDate = null;

// Get DOM elements
const monthYearElement = document.getElementById('month-year');
const calendarGridElement = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Month names in Japanese
const monthNames = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

// Japanese National Holidays (2024-2026)
const holidays = {
  2024: [
    { month: 0, day: 1, name: '元日' },
    { month: 0, day: 8, name: '成人の日' },
    { month: 1, day: 11, name: '建国記念の日' },
    { month: 1, day: 12, name: '振替休日' },
    { month: 1, day: 23, name: '天皇誕生日' },
    { month: 2, day: 20, name: '春分の日' },
    { month: 3, day: 29, name: '昭和の日' },
    { month: 4, day: 3, name: '憲法記念日' },
    { month: 4, day: 4, name: 'みどりの日' },
    { month: 4, day: 5, name: 'こどもの日' },
    { month: 4, day: 6, name: '振替休日' },
    { month: 6, day: 15, name: '海の日' },
    { month: 7, day: 11, name: '山の日' },
    { month: 7, day: 12, name: '振替休日' },
    { month: 8, day: 16, name: '敬老の日' },
    { month: 8, day: 22, name: '秋分の日' },
    { month: 8, day: 23, name: '振替休日' },
    { month: 9, day: 14, name: 'スポーツの日' },
    { month: 10, day: 3, name: '文化の日' },
    { month: 10, day: 4, name: '振替休日' },
    { month: 10, day: 23, name: '勤労感謝の日' }
  ],
  2025: [
    { month: 0, day: 1, name: '元日' },
    { month: 0, day: 13, name: '成人の日' },
    { month: 1, day: 11, name: '建国記念の日' },
    { month: 1, day: 23, name: '天皇誕生日' },
    { month: 1, day: 24, name: '振替休日' },
    { month: 2, day: 20, name: '春分の日' },
    { month: 3, day: 29, name: '昭和の日' },
    { month: 4, day: 3, name: '憲法記念日' },
    { month: 4, day: 4, name: 'みどりの日' },
    { month: 4, day: 5, name: 'こどもの日' },
    { month: 4, day: 6, name: '振替休日' },
    { month: 6, day: 21, name: '海の日' },
    { month: 7, day: 11, name: '山の日' },
    { month: 8, day: 15, name: '敬老の日' },
    { month: 8, day: 23, name: '秋分の日' },
    { month: 9, day: 13, name: 'スポーツの日' },
    { month: 10, day: 3, name: '文化の日' },
    { month: 10, day: 23, name: '勤労感謝の日' },
    { month: 10, day: 24, name: '振替休日' }
  ],
  2026: [
    { month: 0, day: 1, name: '元日' },
    { month: 0, day: 12, name: '成人の日' },
    { month: 1, day: 11, name: '建国記念の日' },
    { month: 1, day: 23, name: '天皇誕生日' },
    { month: 2, day: 20, name: '春分の日' },
    { month: 3, day: 29, name: '昭和の日' },
    { month: 4, day: 3, name: '憲法記念日' },
    { month: 4, day: 4, name: 'みどりの日' },
    { month: 4, day: 5, name: 'こどもの日' },
    { month: 4, day: 6, name: '振替休日' },
    { month: 6, day: 20, name: '海の日' },
    { month: 7, day: 11, name: '山の日' },
    { month: 8, day: 21, name: '敬老の日' },
    { month: 8, day: 22, name: '国民の休日' },
    { month: 8, day: 23, name: '秋分の日' },
    { month: 9, day: 12, name: 'スポーツの日' },
    { month: 10, day: 3, name: '文化の日' },
    { month: 10, day: 23, name: '勤労感謝の日' }
  ]
};

// Function to check if a date is a holiday
function isHoliday(year, month, day) {
  if (!holidays[year]) return null;
  const holiday = holidays[year].find(h => h.month === month && h.day === day);
  return holiday ? holiday.name : null;
}

// Function to get the first day of the month (Monday = 0, Sunday = 6)
function getFirstDayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  // Convert Sunday (0) to 6, and shift Monday to 0
  return firstDay === 0 ? 6 : firstDay - 1;
}

// Function to get the number of days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Function to check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Function to check if a day is weekend (Saturday or Sunday)
function isWeekend(dayIndex) {
  // dayIndex: 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun
  return dayIndex === 5 || dayIndex === 6;
}

// Function to render the calendar
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update month-year display
  monthYearElement.textContent = `${year}年 ${monthNames[month]}`;

  // Clear previous calendar
  calendarGridElement.innerHTML = '';

  // Get calendar data
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const today = new Date();

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayElement = createDayElement(day, true, -1);
    calendarGridElement.appendChild(dayElement);
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = isSameDay(date, today);
    const dayIndex = (firstDay + day - 1) % 7;
    const weekend = isWeekend(dayIndex);
    const holidayName = isHoliday(year, month, day);

    const dayElement = createDayElement(day, false, dayIndex, isToday, date, weekend, holidayName);
    calendarGridElement.appendChild(dayElement);
  }

  // Add next month's days to fill the grid
  const totalCells = calendarGridElement.children.length;
  const remainingCells = 42 - totalCells; // 6 rows x 7 days

  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDayElement(day, true, -1);
    calendarGridElement.appendChild(dayElement);
  }
}

// Function to create a day element
function createDayElement(day, isOtherMonth, dayIndex, isToday = false, date = null, weekend = false, holidayName = null) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';

  // Create day number text
  const dayNumber = document.createElement('span');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  dayElement.appendChild(dayNumber);

  if (isOtherMonth) {
    dayElement.classList.add('other-month');
  }

  if (isToday) {
    dayElement.classList.add('today');
  }

  if (weekend && !isOtherMonth) {
    dayElement.classList.add('weekend');
  }

  // Add holiday styling and label
  if (holidayName && !isOtherMonth) {
    dayElement.classList.add('holiday');
    dayElement.setAttribute('title', holidayName);

    // Add holiday name as small text
    const holidayLabel = document.createElement('span');
    holidayLabel.className = 'holiday-name';
    holidayLabel.textContent = holidayName;
    dayElement.appendChild(holidayLabel);
  }

  // Add click event
  if (!isOtherMonth) {
    dayElement.addEventListener('click', () => {
      // Remove previous selection
      document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
      });

      // Add selection to clicked day (unless it's today)
      if (!isToday) {
        dayElement.classList.add('selected');
        selectedDate = date;
      }
    });
  }

  return dayElement;
}

// Navigation buttons
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Theme switching (optional - can be controlled via keyboard)
document.addEventListener('keydown', (event) => {
  if (event.key === 't' || event.key === 'T') {
    document.body.classList.toggle('light-theme');
  } else if (event.key === 'h' || event.key === 'H') {
    // Go to today
    currentDate = new Date();
    renderCalendar();
  }
});

// Right-click to toggle theme
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  document.body.classList.toggle('light-theme');
});

// Double-click to go to today
document.addEventListener('dblclick', () => {
  currentDate = new Date();
  renderCalendar();
});

// Initialize calendar
renderCalendar();

// Update calendar at midnight
function scheduleNextUpdate() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = tomorrow - now;

  setTimeout(() => {
    renderCalendar();
    scheduleNextUpdate();
  }, msUntilMidnight);
}

scheduleNextUpdate();

// Log initialization
console.log('Monthly Calendar Widget initialized');
console.log('Keyboard shortcuts:');
console.log('  T: Toggle light theme');
console.log('  H: Go to today');
console.log('  Double-click: Go to today');
console.log('  Right-click: Toggle theme');
