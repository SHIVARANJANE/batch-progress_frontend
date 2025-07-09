// StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';
import BatchList from '../../components/Batches/BatchList';
import './StaffDashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Import FaUserCircle
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const StaffDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState(null);
  const [showProfile, setShowProfile] = useState(false); // New state for profile dropdown

  const staffId = localStorage.getItem('staffId');
  const navigate = useNavigate();

  // Helper to get the correct dashboard path
  const getDashboardPath = () => {
    const userRole = localStorage.getItem('role');
    switch (userRole) {
      case 'super_user':
        return '/SuperAdminDashboard';
      case 'admin':
        return '/AdminDashboard';
      case 'staff':
        return '/StaffDashboard';
      case 'student':
        return '/StudentDashboard';
      default:
        return '/';
    }
  };

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
        toast.error(`Failed to load students: ${error.response?.data?.message || error.message}`); // Added toast for fetch error
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
        // Optimistically update the UI if the API call is successful
        // This makes the UI feel more responsive
        const updatedAttendance = { ...selectedStudent.attendance, [date]: status };
        // If status is null (meaning 'Clear'), remove the entry for that date
        if (status === null) {
          delete updatedAttendance[date];
        }

        setSelectedStudent({ ...selectedStudent, attendance: updatedAttendance });

        setStudents(prevStudents =>
          prevStudents.map(s =>
            s._id === selectedStudent._id
              ? { ...s, attendance: updatedAttendance }
              : s
          )
        );
        // Replace alert with toast.success
        toast.success("Attendance marked successfully!");
      })
      .catch(err => {
        console.error('Error marking attendance:', err.response?.data || err.message);
        // Replace alert with toast.error
        toast.error(`Failed to mark attendance: ${err.response?.data?.message || 'Please try again.'}`);
      });
  };

  return (
    <div className="staff-dashboard-container">
      <div className='top-bar'> {/* Added top-bar for profile icon */}
        <div className='icon-wrapper' onClick={() => setShowProfile(!showProfile)}>
          <FaUserCircle className='icon' />
          {showProfile && (
            <div className='dropdown profile'>
              <h4>Profile</h4>
              <p>Email: {localStorage.getItem('email') || 'Unknown'}</p>
              <p>Role: Staff</p> {/* Display Staff role */}
              <button onClick={() => {
                localStorage.clear();
                navigate('/');
              }}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-header-container">
        <h2>Staff Dashboard</h2>
      </div>

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
                    <th className="start-date-header">Start Date</th>
                    <th className="end-date-header">End Date</th>
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
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default StaffDashboard;