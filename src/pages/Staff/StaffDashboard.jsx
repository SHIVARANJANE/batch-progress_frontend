import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';

const StaffDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students assigned to this staff (implement backend filter as needed)
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students`)
      .then(res => setStudents(res.data))
      .catch(() => setStudents([]));
  }, []);

  return (
    <div>
      <h2>Staff Dashboard</h2>
      <div>
        <h3>Mark Attendance</h3>
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
      </div>
      {selectedStudent && (
        <StudentAttendanceModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          editable={true} // Pass editable prop for staff
          onAttendanceMarked={(date, status) => {
            // Update attendance in backend
            axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${selectedStudent._id}/attendance`, { date, status })
              .then(res => {
                setSelectedStudent({
                  ...selectedStudent,
                  attendance: { ...selectedStudent.attendance, [date]: status }
                });
              });
          }}
        />
      )}
    </div>
  );
};

export default StaffDashboard;