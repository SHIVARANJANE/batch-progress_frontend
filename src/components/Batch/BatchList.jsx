import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BatchList.css'; // ⬅️ Add CSS for cute styling

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/batch`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBatches(res.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const markStudentComplete = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/mark-complete/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchBatches();
    } catch (err) {
      alert('Failed to mark student complete.');
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) return <div className="loading-text">⏳ Loading batches...</div>;

  return (
    <div className="batch-list-container">
      {batches.map((batch) => (
        <div key={batch._id} className="batch-card">
          <div className="batch-header">
            <h3>{batch.courseId?.name || 'Unnamed Course'}</h3>
            <p><strong>Staff:</strong> {batch.staffId?.name || 'Unassigned'}</p>
            <p><strong>Slot:</strong> {batch.timeSlot}</p>
            <p><strong>Frequency:</strong> {batch.frequency}</p>
            <p><strong>Students:</strong> {batch.studentIds?.length} / {batch.maxStudents}</p>
          </div>

          <div className="student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Frequency</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(batch.studentIds || []).map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.frequency}</td>
                    <td>{student.startDate}</td>
                    <td>{student.endDate}</td>
                    <td>
                      <button
                        className="complete-btn"
                        onClick={() => markStudentComplete(batch._id, student._id)}
                      >
                        ✅ Mark Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BatchList;
