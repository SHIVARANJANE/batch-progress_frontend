import React, { useState } from 'react';
import './StudentsTable.css'; // ⬅️ New CSS for the card layout

const StudentsTable = ({ students, onViewAttendance, isAdminView, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="students-table-container">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search by name, email or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="student-cards-wrapper">
        {filtered.map((student) => (
          <div className="student-card" key={student._id}>
            <h3>{student.name}</h3>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Course:</strong> {student.enrollmentId?.courseName || student.enrollmentId?.courseId?.name || '—'}</p>
            <p><strong>Batch Timing:</strong> {student.enrollmentId?.sessionLength ? `${student.enrollmentId.sessionLength} hrs` : '—'}</p>

            <div className="student-actions">
              <button onClick={() => onViewAttendance(student)}>📅 View</button>
              {isAdminView && (
                <>
                  <button onClick={() => onEdit(student)}>✏️ Edit</button>
                  <button className="delete" onClick={() => onDelete(student._id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsTable;
