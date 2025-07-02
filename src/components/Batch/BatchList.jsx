import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const isAdminOrSuperUser = role === 'admin' || role === 'super_user';
  const isStaff = role === 'staff';

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/batch`;
        if (isStaff) url += '?myBatches=1';
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBatches(res.data);
      } catch (err) {
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [isStaff]);

  // Define the function here
  const markStudentComplete = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/mark-complete/${studentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      // Refresh batches after marking complete
      setLoading(true);
      let url = `${process.env.REACT_APP_API_BASE_URL}/api/batch`;
      if (isStaff) url += '?myBatches=1';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBatches(res.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to mark student complete.');
    }
  };

  if (!isAdminOrSuperUser && !isStaff) return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Batches</h2>
      {batches.map(batch => (
        <div key={batch._id}>
          <h4>{batch.courseId?.name} ({batch.timeSlot})</h4>
          <ul>
            {(batch.studentIds || []).map(student => (
              <li key={student._id}>
                {student.name}
                {isStaff && (
                  <button onClick={() => markStudentComplete(batch._id, student._id)}>
                    ✅ Mark Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default BatchList;