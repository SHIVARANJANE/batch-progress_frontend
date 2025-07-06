// StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';
import BatchList from '../../components/Batches/BatchList';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState(null);

  const staffId = localStorage.getItem('staffId');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!staffId) {
        console.warn("Staff ID not found in localStorage. Cannot fetch students.");
        setStudents([]);
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true);
      setErrorStudents(null);

      try {
        // Ensure this API endpoint populates the 'enrollmentId' field to get access to startDate and endDate
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students?staffId=${staffId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (Array.isArray(response.data.data)) {
          setStudents(response.data.data);
        } else {
          console.warn("API response for students is not an array:", response.data);
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students for staff:", error.response?.data || error.message);
        setErrorStudents(`Failed to load students: ${error.response?.data?.message || error.message}`);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [staffId]);

  const handleAttendanceMarked = (date, status) => {
    axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${selectedStudent._id}/mark-attendance`, { date, status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        const updatedAttendance = { ...selectedStudent.attendance, [date]: status };
        setSelectedStudent({ ...selectedStudent, attendance: updatedAttendance });

        setStudents(prevStudents =>
          prevStudents.map(s =>
            s._id === selectedStudent._id
              ? { ...s, attendance: updatedAttendance }
              : s
          )
        );
        alert("Attendance marked successfully!");
      })
      .catch(err => {
        console.error('Error marking attendance:', err.response?.data || err.message);
        alert(`Failed to mark attendance: ${err.response?.data?.message || 'Please try again.'}`);
      });
  };

  return (
    <div className="staff-dashboard-container">
      <h2>Staff Dashboard</h2>

      <div className="tabs-navigation">
        <button
          className={activeTab === 'attendance' ? 'active-tab' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          Mark Attendance
        </button>
        <button
          className={activeTab === 'batches' ? 'active-tab' : ''}
          onClick={() => setActiveTab('batches')}
        >
          My Batches
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'attendance' && (
          <div>
            <h3>Mark Attendance</h3>
            {loadingStudents ? (
              <div className="loading-message">Loading students...</div>
            ) : errorStudents ? (
              <div className="error-message">{errorStudents}</div>
            ) : students.length === 0 ? (
              <div className="no-data-message">No students assigned to your batches yet for attendance.</div>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Batch Slot</th>
                    <th className="start-date-header">Start Date</th> {/* Added header */}
                    <th className="end-date-header">End Date</th> {/* Added header */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(stu => (
                    <tr key={stu._id}>
                      <td>{stu.name}</td>
                      <td>{stu.email}</td>
                      <td>{stu.enrollmentId?.courseName || stu.enrollmentId?.courseId?.name || 'N/A'}</td>
                      <td>{stu.preferredTimeSlot || 'N/A'}</td>
                      <td className="start-date-cell">
                        {stu.enrollmentId?.startDate ? new Date(stu.enrollmentId.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="end-date-cell">
                        {stu.enrollmentId?.endDate ? new Date(stu.enrollmentId.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <button onClick={() => setSelectedStudent(stu)}>Mark Attendance</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'batches' && (
          <div>
            <BatchList staffId={staffId} isAdminView={false} />
          </div>
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