import React, { useEffect, useState } from 'react';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';
import './StudentDashboard.css'; // Import the new CSS file

const StudentDashboard = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false); // Renamed to avoid confusion with tab
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('attendance'); // 'attendance' or 'feedback'

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
      <h2>Welcome, {student.name}</h2>

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
            {/* The StudentAttendanceModal should ideally be rendered directly here
                or its content integrated, not as a modal that covers the whole page,
                if it's a "tab". But based on current usage, we'll keep it as a modal
                that opens, or you can refactor StudentAttendanceModal to be just a component.
                For now, clicking 'View Attendance' tab will open the modal.*/}
            <p>Click the button below to view your attendance history.</p>
            <button className="open-attendance-button" onClick={() => setShowAttendanceModal(true)}>
              Show My Attendance
            </button>
            {showAttendanceModal && (
              <StudentAttendanceModal
                student={student}
                editable={false} // read-only for students
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