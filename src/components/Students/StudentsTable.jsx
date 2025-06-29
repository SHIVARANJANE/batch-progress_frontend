import React, { useState } from 'react';

const StudentsTable = ({ students, onViewAttendance, isAdminView, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="students-table-container">
      <input
        type="text"
        placeholder="🔍 Search by name, email or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Batch Timing</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.enrollmentId?.courseName || student.enrollmentId?.courseId?.name || '—'}</td>
              <td>{student.enrollmentId?.sessionLength ? `${student.enrollmentId.sessionLength} hrs` : '—'}</td>
              <td>
                <button onClick={() => onViewAttendance(student)}>📅 View</button>
                {isAdminView && (
                  <>
                    <button onClick={() => onEdit(student)}>✏️ Edit</button>
                    <button onClick={() => onDelete(student._id)}>🗑️ Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;
