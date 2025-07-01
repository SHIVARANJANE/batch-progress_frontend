import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';

const StaffDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Get staffId from localStorage (or auth context)
  const staffId = localStorage.getItem('staffId');

  useEffect(() => {
    if (!staffId) return;
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students?staffId=${staffId}`)
      .then(res => setStudents(res.data))
      .catch(() => setStudents([]));
  }, [staffId]);

  const handleAttendanceMarked = (date, status) => {
    axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${selectedStudent._id}/attendance`, { date, status })
      .then(res => {
        const updatedAttendance = { ...selectedStudent.attendance, [date]: status };
        setSelectedStudent({ ...selectedStudent, attendance: updatedAttendance });
        setStudents(students =>
          students.map(s =>
            s._id === selectedStudent._id
              ? { ...s, attendance: updatedAttendance }
              : s
          )
        );
      });
  };

  return (
    <div>
      <h2>Staff Dashboard</h2>
      <div>
        <h3>Mark Attendance</h3>
        {students.length === 0 ? (
          <div>No students assigned yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(stu => (
                <tr key={stu._id}>
                  <td>{stu.name}</td>
                  <td>{stu.email}</td>
                  <td>{stu.enrollmentId?.courseName || stu.enrollmentId?.courseId?.name || ''}</td>
                  <td>
                    <button onClick={() => setSelectedStudent(stu)}>Mark Attendance</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedStudent && (
        <StudentAttendanceModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          editable={true}
          onAttendanceMarked={handleAttendanceMarked}
        />
      )}
    </div>
  );
};

export default StaffDashboard;