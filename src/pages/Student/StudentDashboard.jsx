import React, { useEffect, useState } from 'react';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Import FaUserCircle

const StudentDashboard = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('attendance');
  const [showProfile, setShowProfile] = useState(false); // New state for profile dropdown
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
    if (studentId) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${studentId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setStudent(data);
          setError(null);
        })
        .catch(err => {
          console.error("Failed to fetch student data:", err);
          setError("Failed to load student data. Please try again.");
          setStudent(null);
        });
    } else {
      setError("Student ID is missing. Cannot load dashboard.");
      setStudent(null);
    }
  }, [studentId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${studentId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: Number(feedback) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setFeedbackSubmitted(true);
      setFeedback('');
      setError(null);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!student) {
    return <div className="loading-message">Loading student data...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className='top-bar'> {/* Added top-bar for profile icon */}
        <div className='icon-wrapper' onClick={() => setShowProfile(!showProfile)}>
          <FaUserCircle className='icon' />
          {showProfile && (
            <div className='dropdown profile'>
              <h4>Profile</h4>
              <p>Email: {localStorage.getItem('email') || 'Unknown'}</p>
              <p>Role: Student</p> {/* Display Student role */}
              <button onClick={() => {
                localStorage.clear();
                navigate('/');
              }}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-header-container">
        <h2>Welcome, {student.name}</h2>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-button ${selectedTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setSelectedTab('attendance')}
        >
          View Attendance
        </button>
        <button
          className={`tab-button ${selectedTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setSelectedTab('feedback')}
        >
          Give Feedback
        </button>
      </div>

      <div className="tab-content">
        {selectedTab === 'attendance' && (
          <div className="attendance-section">
            <p>Click the button below to view your attendance history.</p>
            <button className="open-attendance-button" onClick={() => setShowAttendanceModal(true)}>
              Show My Attendance
            </button>
            {showAttendanceModal && (
              <StudentAttendanceModal
                student={student}
                editable={false}
                onClose={() => setShowAttendanceModal(false)}
              />
            )}
          </div>
        )}

        {selectedTab === 'feedback' && (
          <div className="feedback-section">
            <h3>Give Feedback for Staff</h3>
            {feedbackSubmitted ? (
              <div className="feedback-success-message">Thank you for your feedback!</div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label htmlFor="staff-rating">
                    Rate your staff (1-10):
                  </label>
                  <input
                    id="staff-rating"
                    type="number"
                    min="1"
                    max="10"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    required
                    className="feedback-input"
                  />
                </div>
                <button type="submit" className="submit-feedback-button">Submit Feedback</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;