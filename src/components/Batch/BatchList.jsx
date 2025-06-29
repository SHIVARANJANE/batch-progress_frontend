import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/batch`, {
        withCredentials: true
      });
      setBatches(res.data);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) return <p>Loading batches...</p>;

  return (
    <div className="batch-list">
      <h2>📚 Batches</h2>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Staff</th>
            <th>Time Slot</th>
            <th>Students</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(batch => (
            <tr key={batch._id}>
              <td>{batch.courseId?.name}</td>
              <td>{batch.staffId?.name}</td>
              <td>{batch.timeSlot}</td>
              <td>{batch.studentIds?.length} / {batch.maxStudents}</td>
              <td>{batch.studentIds?.length >= batch.maxStudents ? 'Full' : 'Open'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BatchList;
