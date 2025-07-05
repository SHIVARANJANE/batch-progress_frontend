// StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';
import BatchList from '../../components/Batches/BatchList'; // Import the new BatchList component
import './StaffDashboard.css'; // You might need to create this for tab styling

const StaffDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'batches'
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState(null);

  // Get staffId from localStorage (or auth context)
  const staffId = localStorage.getItem('staffId'); // Ensure 'staffId' is stored here upon login

  useEffect(() => {
    const fetchStudents = async () => {
      if (!staffId) {
        console.warn("Staff ID not found in localStorage. Cannot fetch students.");
        setStudents([]); // Ensure students is an empty array
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true); // Set loading to true before fetching
      setErrorStudents(null); // Clear previous errors

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students?staffId=${staffId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Include auth token
          }
        });
        // Ensure response.data.data is an array, default to empty array if not
        if (Array.isArray(response.data.data)) {
          setStudents(response.data.data);
        } else {
          console.warn("API response for students is not an array:", response.data);
          setStudents([]); // Default to empty array to prevent 'length' error
        }
      } catch (error) {
        console.error("Error fetching students for staff:", error.response?.data || error.message);
        setErrorStudents(`Failed to load students: ${error.response?.data?.message || error.message}`);
        setStudents([]); // Default to empty array on error
      } finally {
        setLoadingStudents(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchStudents();
  }, [staffId]); // Re-run effect if staffId changes

  const handleAttendanceMarked = (date, status) => {
    // Corrected API endpoint for marking attendance
    axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${selectedStudent._id}/mark-attendance`, { date, status }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Include auth token
      }
    })
      .then(res => {
        // Assuming your backend returns the updated attendance or simply a success status
        const updatedAttendance = { ...selectedStudent.attendance, [date]: status };
        setSelectedStudent({ ...selectedStudent, attendance: updatedAttendance });
        
        // Update the student list in the state to reflect the attendance change immediately
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s._id === selectedStudent._id
              ? { ...s, attendance: updatedAttendance } // Update the specific student's attendance
              : s
          )
        );
        // Optionally, show a success message
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
                    <th>Batch Slot</th> {/* Added Batch Slot for clarity */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(stu => (
                    <tr key={stu._id}>
                      <td>{stu.name}</td>
                      <td>{stu.email}</td>
                      <td>{stu.enrollmentId?.courseName || stu.enrollmentId?.courseId?.name || 'N/A'}</td>
                      <td>{stu.preferredTimeSlot || 'N/A'}</td> {/* Displaying preferredTimeSlot from student */}
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
            {/* Render BatchList for staff view, passing the staffId */}
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