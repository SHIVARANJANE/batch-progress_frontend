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

const StudentAttendanceModal = ({ student, onClose }) => {
  const attendance = student.attendance || {};
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(year, currentMonth.getMonth(), i + 1);
    const formatted = date.toISOString().split('T')[0];
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
        <h3>📅 Attendance - {student.name} ({student.course})</h3>
        <span>Start Date: {student.startDate} | End Date: {student.endDate}</span>
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

          {days.map(({ day, status }, idx) => (
            <div key={idx} className={`day-cell ${getStatusColor(status)}`}>
              <span>{day}</span>
              <div className="status-label">{status}</div>
            </div>
          ))}
        </div>

        <div className="attendance-summary">
          <strong>No. of Hours Attended:</strong> {presentDays} / {totalMarked}
        </div>

        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

export default StudentAttendanceModal;
