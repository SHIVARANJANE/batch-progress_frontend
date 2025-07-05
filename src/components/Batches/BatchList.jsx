// src/components/Batches/BatchList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BatchList.css'; // Create this CSS file for styling

const BatchList = ({ staffId, isAdminView }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/batches`;
        if (staffId) {
          // If staffId is provided, fetch only batches for that staff
          url = `${process.env.REACT_APP_API_BASE_URL}/api/batches/staff/${staffId}`;
        }
        // No explicit else for isAdminView, as the default /api/batches fetches all

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming you store token in localStorage
          }
        });
        setBatches(response.data.data);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError('Failed to fetch batches. Please try again.');
        setBatches([]); // Clear batches on error
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [staffId, isAdminView]); // Re-fetch if staffId or view type changes

  if (loading) {
    return <div className="loading-message">Loading batches...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (batches.length === 0) {
    return <div className="no-data-message">No batches found for this view.</div>;
  }

  return (
    <div className="batch-list-container">
      <h3>{isAdminView ? 'All Batches' : 'My Batches'}</h3>
      {batches.map(batch => (
        <div key={batch._id} className="batch-card">
          <div className="batch-header">
            <h4>Course: {batch.courseId?.name || 'N/A'}</h4>
            {isAdminView && <p>Staff: {batch.staffId?.name || 'N/A'}</p>}
            <p className="batch-occupancy">
              {batch.students ? `${batch.students.length}/${batch.maxStudents}` : `0/${batch.maxStudents}`}
            </p>
          </div>
          <p>Time Slot: {batch.slotTiming}</p>
          <h5>Students:</h5>
          {batch.students && batch.students.length > 0 ? (
            <ul className="student-list">
              {batch.students.map(student => (
                <li key={student._id}>
                  {student.name} ({student.email || student.mobile || 'N/A'})
                </li>
              ))}
            </ul>
          ) : (
            <p>No students in this batch yet.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default BatchList;