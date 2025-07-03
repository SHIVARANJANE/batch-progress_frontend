import React, { useEffect, useState } from 'react';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';

const StudentDashboard = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    // Only fetch data if studentId is not null or undefined
    if (studentId) {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${studentId}`)
        .then(res => {
          if (!res.ok) {
            // If response is not OK (e.g., 404, 500), throw an error
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setStudent(data);
          setError(null); // Clear any previous errors
        })
        .catch(err => {
          console.error("Failed to fetch student data:", err);
          setError("Failed to load student data. Please try again."); // Set user-friendly error message
          setStudent(null); // Ensure student is null on error
        });
    } else {
      // If studentId is null/undefined, set an error
      setError("Student ID is missing. Cannot load dashboard.");
      setStudent(null);
    }
  }, [studentId]); // Depend on studentId, so it re-runs if studentId changes

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
      setFeedback(''); // Clear feedback input after submission
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>; // Display error message
  }

  if (!student) {
    return <div>Loading student data...</div>; // Loading state
  }

  return (
    <div className="student-dashboard">
      <h2>Welcome, {student.name}</h2>
      <button onClick={() => setShowAttendance(true)}>View Attendance</button>
      {showAttendance && (
        <StudentAttendanceModal
          student={student}
          editable={false} // read-only for students
          onClose={() => setShowAttendance(false)}
        />
      )}
      <div className="feedback-section">
        <h3>Give Feedback for Staff</h3>
        {feedbackSubmitted ? (
          <div>Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleFeedbackSubmit}>
            <label>
              Rate your staff (1-10):
              <input
                type="number"
                min="1"
                max="10"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
              />
            </label>
            <button type="submit">Submit Feedback</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
