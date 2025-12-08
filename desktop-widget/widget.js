// Desktop Widget Logic - Clock + Calendar + Alarm

// ==================== Clock ====================
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const secondHand = document.getElementById('second-hand');
const digitalTime = document.getElementById('digital-time');

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate degrees
  const secondDegrees = ((seconds + milliseconds / 1000) * 6);
  const minuteDegrees = ((minutes + seconds / 60) * 6);
  const hourDegrees = ((hours % 12 + minutes / 60) * 30);

  // Update hands
  secondHand.style.transform = `rotate(${secondDegrees}deg)`;
  minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
  hourHand.style.transform = `rotate(${hourDegrees}deg)`;

  // Update digital time
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  digitalTime.textContent = timeString;

  // Check alarms
  checkAlarms(hours, minutes, seconds);
}

// Update clock every 50ms for smooth second hand
setInterval(updateClock, 50);
updateClock();

// ==================== Calendar ====================
const calendarTitle = document.getElementById('calendar-title');
const calendarDays = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();

// Japanese holidays (2024-2026)
const holidays = {
  2024: [
    { month: 1, day: 1, name: '元日' },
    { month: 1, day: 8, name: '成人の日' },
    { month: 2, day: 11, name: '建国記念の日' },
    { month: 2, day: 12, name: '振替休日' },
    { month: 2, day: 23, name: '天皇誕生日' },
    { month: 3, day: 20, name: '春分の日' },
    { month: 4, day: 29, name: '昭和の日' },
    { month: 5, day: 3, name: '憲法記念日' },
    { month: 5, day: 4, name: 'みどりの日' },
    { month: 5, day: 5, name: 'こどもの日' },
    { month: 5, day: 6, name: '振替休日' },
    { month: 7, day: 15, name: '海の日' },
    { month: 8, day: 11, name: '山の日' },
    { month: 8, day: 12, name: '振替休日' },
    { month: 9, day: 16, name: '敬老の日' },
    { month: 9, day: 22, name: '秋分の日' },
    { month: 9, day: 23, name: '振替休日' },
    { month: 10, day: 14, name: 'スポーツの日' },
    { month: 11, day: 3, name: '文化の日' },
    { month: 11, day: 4, name: '振替休日' },
    { month: 11, day: 23, name: '勤労感謝の日' }
  ],
  2025: [
    { month: 1, day: 1, name: '元日' },
    { month: 1, day: 13, name: '成人の日' },
    { month: 2, day: 11, name: '建国記念の日' },
    { month: 2, day: 23, name: '天皇誕生日' },
    { month: 2, day: 24, name: '振替休日' },
    { month: 3, day: 20, name: '春分の日' },
    { month: 4, day: 29, name: '昭和の日' },
    { month: 5, day: 3, name: '憲法記念日' },
    { month: 5, day: 4, name: 'みどりの日' },
    { month: 5, day: 5, name: 'こどもの日' },
    { month: 5, day: 6, name: '振替休日' },
    { month: 7, day: 21, name: '海の日' },
    { month: 8, day: 11, name: '山の日' },
    { month: 9, day: 15, name: '敬老の日' },
    { month: 9, day: 23, name: '秋分の日' },
    { month: 10, day: 13, name: 'スポーツの日' },
    { month: 11, day: 3, name: '文化の日' },
    { month: 11, day: 23, name: '勤労感謝の日' },
    { month: 11, day: 24, name: '振替休日' }
  ],
  2026: [
    { month: 1, day: 1, name: '元日' },
    { month: 1, day: 12, name: '成人の日' },
    { month: 2, day: 11, name: '建国記念の日' },
    { month: 2, day: 23, name: '天皇誕生日' },
    { month: 3, day: 20, name: '春分の日' },
    { month: 4, day: 29, name: '昭和の日' },
    { month: 5, day: 3, name: '憲法記念日' },
    { month: 5, day: 4, name: 'みどりの日' },
    { month: 5, day: 5, name: 'こどもの日' },
    { month: 5, day: 6, name: '振替休日' },
    { month: 7, day: 20, name: '海の日' },
    { month: 8, day: 11, name: '山の日' },
    { month: 9, day: 21, name: '敬老の日' },
    { month: 9, day: 22, name: '国民の休日' },
    { month: 9, day: 23, name: '秋分の日' },
    { month: 10, day: 12, name: 'スポーツの日' },
    { month: 11, day: 3, name: '文化の日' },
    { month: 11, day: 23, name: '勤労感謝の日' }
  ]
};

function isHoliday(year, month, day) {
  if (!holidays[year]) return null;
  const holiday = holidays[year].find(h => h.month === month && h.day === day);
  return holiday ? holiday.name : null;
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update title
  calendarTitle.textContent = `${year}年 ${month + 1}月`;

  // Clear previous days
  calendarDays.innerHTML = '';

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  const firstDayMonday = firstDay === 0 ? 6 : firstDay - 1;

  // Get total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Today
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Add previous month's days
  for (let i = firstDayMonday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = document.createElement('div');
    dayEl.className = 'day other-month';
    dayEl.textContent = day;
    calendarDays.appendChild(dayEl);
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    dayEl.className = 'day';
    dayEl.textContent = day;

    // Check if today
    if (isCurrentMonth && day === todayDate) {
      dayEl.classList.add('today');
    }

    // Check if Saturday or Sunday
    if (dayOfWeek === 6) {
      dayEl.classList.add('saturday');
    } else if (dayOfWeek === 0) {
      dayEl.classList.add('sunday');
    }

    // Check if holiday
    const holidayName = isHoliday(year, month + 1, day);
    if (holidayName) {
      dayEl.classList.add('holiday');
      dayEl.title = holidayName;
    }

    calendarDays.appendChild(dayEl);
  }

  // Add next month's days
  const totalCells = calendarDays.children.length;
  const remainingCells = 35 - totalCells; // 5 weeks = 35 cells

  for (let day = 1; day <= remainingCells; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'day other-month';
    dayEl.textContent = day;
    calendarDays.appendChild(dayEl);
  }
}

prevMonthBtn.addEventListener('click', () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  currentDate = new Date(year, month + 1, 1);
  renderCalendar();
});

renderCalendar();

// ==================== Alarms ====================
const alarmList = document.getElementById('alarm-list');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const closeBtn = document.getElementById('close-btn');
const alarmModal = document.getElementById('alarm-modal');
const modalClose = document.getElementById('modal-close');
const cancelAlarm = document.getElementById('cancel-alarm');
const saveAlarm = document.getElementById('save-alarm');
const alarmHourInput = document.getElementById('alarm-hour');
const alarmMinuteInput = document.getElementById('alarm-minute');
const alarmLabelInput = document.getElementById('alarm-label');
const alarmEnabledInput = document.getElementById('alarm-enabled');

let alarms = JSON.parse(localStorage.getItem('alarms') || '[]');
let editingAlarmId = null;
let lastAlarmCheck = { hour: -1, minute: -1 };

// Audio context for alarm sound
let audioContext = null;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playAlarmSound() {
  initAudioContext();

  const duration = 2000; // 2 seconds
  const frequency = 800; // Hz

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);

  // Play 3 beeps
  setTimeout(() => playBeep(frequency), 300);
  setTimeout(() => playBeep(frequency), 600);
}

function playBeep(frequency) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="80">🔔</text></svg>',
      requireInteraction: true
    });
  }
}

function checkAlarms(hours, minutes, seconds) {
  // Only check once per minute (when seconds = 0)
  if (seconds !== 0) return;
  if (lastAlarmCheck.hour === hours && lastAlarmCheck.minute === minutes) return;

  lastAlarmCheck = { hour: hours, minute: minutes };

  const today = new Date();
  const dayOfWeek = today.getDay();

  alarms.forEach(alarm => {
    if (!alarm.enabled) return;

    // Check if alarm time matches
    if (alarm.hour !== hours || alarm.minute !== minutes) return;

    // Check if alarm is set for today
    if (alarm.repeatDays.length > 0 && !alarm.repeatDays.includes(dayOfWeek)) return;

    // Trigger alarm!
    triggerAlarm(alarm);
  });
}

function triggerAlarm(alarm) {
  const timeStr = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;
  const message = alarm.label ? `${alarm.label}` : 'アラーム';

  // Show notification
  showNotification(`🔔 ${timeStr}`, message);

  // Play sound
  playAlarmSound();

  // Show in-widget alert
  showAlarmAlert(timeStr, message);
}

function showAlarmAlert(time, message) {
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 100, 100, 0.95);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    z-index: 2000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: pulse 0.5s ease-in-out infinite alternate;
  `;
  alertDiv.innerHTML = `
    <div style="font-size: 40px; margin-bottom: 10px;">🔔</div>
    <div style="font-size: 24px; margin-bottom: 8px;">${time}</div>
    <div style="font-size: 16px;">${message}</div>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 15px;
      padding: 8px 20px;
      background: white;
      color: #ff6464;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    ">停止</button>
  `;

  document.body.appendChild(alertDiv);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 30000);
}

function renderAlarms() {
  alarmList.innerHTML = '';

  if (alarms.length === 0) {
    alarmList.innerHTML = '<div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 12px; padding: 8px;">アラームなし</div>';
    return;
  }

  alarms.forEach((alarm, index) => {
    const alarmEl = document.createElement('div');
    alarmEl.className = `alarm-item ${!alarm.enabled ? 'disabled' : ''}`;

    const timeStr = `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`;

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const repeatStr = alarm.repeatDays.length > 0
      ? alarm.repeatDays.map(d => dayNames[d]).join(',')
      : '1回のみ';

    alarmEl.innerHTML = `
      <div class="alarm-info">
        <div class="alarm-time">⏰ ${timeStr}</div>
        <div class="alarm-label">${alarm.label || '(ラベルなし)'}</div>
        <div class="alarm-days">${repeatStr}</div>
      </div>
      <div class="alarm-controls">
        <button class="alarm-toggle" onclick="toggleAlarm(${index})">${alarm.enabled ? 'ON' : 'OFF'}</button>
        <button class="alarm-delete" onclick="deleteAlarm(${index})">削除</button>
      </div>
    `;

    alarmList.appendChild(alarmEl);
  });

  saveAlarms();
}

function saveAlarms() {
  localStorage.setItem('alarms', JSON.stringify(alarms));
}

function toggleAlarm(index) {
  alarms[index].enabled = !alarms[index].enabled;
  renderAlarms();
}

function deleteAlarm(index) {
  if (confirm('このアラームを削除しますか?')) {
    alarms.splice(index, 1);
    renderAlarms();
  }
}

// Make functions global for onclick handlers
window.toggleAlarm = toggleAlarm;
window.deleteAlarm = deleteAlarm;

addAlarmBtn.addEventListener('click', () => {
  editingAlarmId = null;
  alarmHourInput.value = '7';
  alarmMinuteInput.value = '0';
  alarmLabelInput.value = '';
  alarmEnabledInput.checked = true;
  document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
  alarmModal.style.display = 'flex';
});

modalClose.addEventListener('click', () => {
  alarmModal.style.display = 'none';
});

cancelAlarm.addEventListener('click', () => {
  alarmModal.style.display = 'none';
});

saveAlarm.addEventListener('click', () => {
  const hour = parseInt(alarmHourInput.value);
  const minute = parseInt(alarmMinuteInput.value);
  const label = alarmLabelInput.value.trim();
  const enabled = alarmEnabledInput.checked;

  // Validate
  if (isNaN(hour) || hour < 0 || hour > 23) {
    alert('時刻が正しくありません（0-23）');
    return;
  }
  if (isNaN(minute) || minute < 0 || minute > 59) {
    alert('分が正しくありません（0-59）');
    return;
  }

  // Get selected days
  const repeatDays = Array.from(document.querySelectorAll('.day-btn.active'))
    .map(btn => parseInt(btn.dataset.day));

  const alarm = {
    hour,
    minute,
    label,
    enabled,
    repeatDays
  };

  if (editingAlarmId !== null) {
    alarms[editingAlarmId] = alarm;
  } else {
    alarms.push(alarm);
  }

  renderAlarms();
  alarmModal.style.display = 'none';
});

// Day buttons toggle
document.querySelectorAll('.day-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
  });
});

// Request notification permission
if ('Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

renderAlarms();

// Close button
closeBtn.addEventListener('click', () => {
  window.close();
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Close with Escape key
  if (event.key === 'Escape') {
    window.close();
  }

  // Theme switching with T key
  if (event.key === 't' || event.key === 'T') {
    document.body.classList.toggle('light-theme');
  }
});

// Right-click to toggle theme
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  document.body.classList.toggle('light-theme');
});

console.log('Desktop Widget initialized');
