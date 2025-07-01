import React, { useEffect, useState } from 'react';
import StudentAttendanceModal from '../../components/Students/StudentsAttendanceModal';

const StudentDashboard = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${studentId}`)
      .then(res => res.json())
      .then(setStudent);
  }, [studentId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/students/${studentId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: Number(feedback) }),
    });
    setFeedbackSubmitted(true);
  };

  if (!student) return <div>Loading...</div>;

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