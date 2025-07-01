// src/components/StudentAttendanceModal.jsx
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
  const [showMarkDialog, setShowMarkDialog] = useState({open: false,date:null});
  const [monthOffset, setMonthOffset] = useState(0);
   const enrollment = student.enrollmentId || {};
  const startDate = student.startDate || enrollment.startDate?.split('T')[0] || '';
  const endDate = student.endDate || enrollment.endDate?.split('T')[0] || '';
  const course =
    student.course ||
    enrollment.courseName ||
    enrollment.courseId?.name ||
    enrollment.courseId ||
    '';
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Make Monday = 0, Sunday = 6
const jsDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
const startDay = (jsDay + 6) % 7;
  const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

const days = Array.from({ length: totalDays }, (_, i) => {
  const pad = n => n.toString().padStart(2, '0');
  const formatted = `${year}-${pad(currentMonth.getMonth() + 1)}-${pad(i + 1)}`;
  return {
    day: i + 1,
    status: attendance[formatted] || 'Not Marked',
  };
});

  const presentDays = Object.values(attendance).filter((a) => a === 'Present').length;
  const totalMarked = Object.keys(attendance).length;

  return (
    <div className="modal-overlay">
      <div className="form-modal calendar-modal">
        <h3>📅 Attendance - {student.name} ({course})</h3>
        <span>Start Date: {startDate} | End Date: {endDate}</span>
        <div className="calendar-controls">
          <button onClick={() => setMonthOffset((prev) => prev - 1)}>&lt;</button>
          <span>{monthName} {year}</span>
          <button onClick={() => setMonthOffset((prev) => prev + 1)}>&gt;</button>
        </div>

        <div className="calendar-grid">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="day-header">{d}</div>
          ))}

          {Array(startDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty"></div>
          ))}

          {days.map(({ day, status }, idx) => {
            const pad = n => n.toString().padStart(2, '0');
            const date = `${year}-${pad(currentMonth.getMonth() + 1)}-${pad(day)}`;
            return (
              <div
                key={idx}
                className={`day-cell ${getStatusColor(status)}`}
                style={{ cursor: editable ? 'pointer' : 'default' }}
                onClick={() => editable && setShowMarkDialog({ open: true, date })}
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