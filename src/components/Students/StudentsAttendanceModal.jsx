import React, { useState } from 'react';
import './StudentAttendanceModal.css'; // new CSS file for styles

const getStatusColor = (status) => {
  switch (status) {
    case 'Present':
      return 'present';
    case 'Absent':
      return 'absent';
    default:
      return 'not-marked';
  }
};

const StudentAttendanceModal = ({ student, onClose, editable = false, onAttendanceMarked }) => {
  const attendance = student.attendance || {};
  const [showMarkDialog, setShowMarkDialog] = useState({ open: false, date: null });
  const [monthOffset, setMonthOffset] = useState(0);

  const enrollment = student.enrollmentId || {};
  const startDateStr = student.startDate || enrollment.startDate?.split('T')[0] || '';
  const endDateStr = student.endDate || enrollment.endDate?.split('T')[0] || '';
  const course =
    student.course ||
    enrollment.courseName ||
    enrollment.courseId?.name ||
    enrollment.courseId ||
    '';

  // Normalize today's date to start of day for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse start and end dates, normalizing to start of day
  const parsedStartDate = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
  const parsedEndDate = endDateStr ? new Date(endDateStr + 'T00:00:00') : null;

  // Determine the current month being displayed based on offset
  const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Calculate the day of the week for the 1st of the current displayed month
  // This is used to correctly position the first day in the calendar grid (Monday = 0, Sunday = 6)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // Number of empty cells before the 1st day

  // Get the total number of days in the current displayed month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    dayDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    const pad = n => n.toString().padStart(2, '0');
    const formattedDate = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDate.getDate())}`;

    // Check if the current day falls within the student's enrollment period
    const isWithinEnrollmentPeriod =
      (!parsedStartDate || dayDate >= parsedStartDate) &&
      (!parsedEndDate || dayDate <= parsedEndDate);

    // Check if it's a future date relative to today
    const isFutureDate = dayDate > today;

    calendarDays.push({
      day: i,
      status: attendance[formattedDate] || 'Not Marked',
      date: formattedDate,
      isWithinEnrollmentPeriod: isWithinEnrollmentPeriod,
      isFutureDate: isFutureDate,
    });
  }

  // Filter the days to only show those within the enrollment period for the current month view
  const displayDays = calendarDays.filter(day => day.isWithinEnrollmentPeriod);

  // Calculate attendance summary
  const presentDays = Object.values(attendance).filter((a) => a === 'Present').length;
  const totalMarked = Object.keys(attendance).length;

  return (
    <div className="modal-overlay">
      <div className="form-modal calendar-modal">
        <h3>📅 Attendance - {student.name} ({course})</h3>
        <span>Start Date: {startDateStr} | End Date: {endDateStr}</span>
        <div className="calendar-controls">
          <button onClick={() => setMonthOffset((prev) => prev - 1)}>&lt;</button>
          <span>{monthName} {year}</span>
          <button onClick={() => setMonthOffset((prev) => prev + 1)}>&gt;</button>
        </div>

        <div className="calendar-grid">
          {/* Day headers */}
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="day-header">{d}</div>
          ))}

          {/* Render empty cells for the days before the 1st of the month to align the grid */}
          {Array(startDayOffset).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty"></div>
          ))}

          {/* Render the actual calendar days */}
          {displayDays.map(({ day, status, date, isFutureDate }, idx) => {
            // Determine if the cell is clickable (editable and not a future date)
            const canMark = editable && !isFutureDate;
            return (
              <div
                key={idx}
                className={`day-cell ${getStatusColor(status)} ${isFutureDate ? 'future-date' : ''}`}
                style={{ cursor: canMark ? 'pointer' : 'default' }}
                onClick={() => canMark && setShowMarkDialog({ open: true, date })}
              >
                <span>{day}</span>
                <div className="status-label">{status}</div>
              </div>
            );
          })}
        </div>

        <div className="attendance-summary">
          <strong>No. of Hours Attended:</strong> {presentDays} / {totalMarked}
        </div>
        <button onClick={onClose} className="close-btn">Close</button>

        {/* Attendance marking dialog */}
        {showMarkDialog.open && (
          <div className="attendance-dialog">
            <div>
              <p>
                Mark attendance for {showMarkDialog.date &&
                new Date(showMarkDialog.date + 'T00:00:00').toLocaleDateString('en-IN')}
              </p>
              <button onClick={() => {
                onAttendanceMarked(showMarkDialog.date, 'Present');
                setShowMarkDialog({ open: false, date: null });
              }}>Present</button>
              <button onClick={() => {
                onAttendanceMarked(showMarkDialog.date, 'Absent');
                setShowMarkDialog({ open: false, date: null });
              }}>Absent</button>
              <button onClick={() => {
                onAttendanceMarked(showMarkDialog.date, null); // Clear attendance
                setShowMarkDialog({ open: false, date: null });
              }}>Clear</button>
              <button onClick={() => setShowMarkDialog({ open: false, date: null })}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceModal;
