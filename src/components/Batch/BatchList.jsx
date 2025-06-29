import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading batches...</p>;

  return (
    <div className="grid gap-4">
      {batches.map((batch) => (
        <div
          key={batch._id}
          className="bg-white border border-gray-200 rounded-2xl shadow p-4 hover:shadow-md transition duration-200"
        >
          <h3 className="text-xl font-bold text-blue-800">{batch.courseId?.name || 'Unnamed Course'}</h3>
          <p><strong>Staff:</strong> {batch.staffId?.name || 'Unassigned'}</p>
          <p><strong>Time Slot:</strong> {batch.timeSlot}</p>
          <p><strong>Frequency:</strong> {batch.frequency}</p>
          <p><strong>Students:</strong> {batch.studentIds?.length} / {batch.maxStudents}</p>
          <p><strong>Status:</strong> {batch.status}</p>
        </div>
      ))}
    </div>
  );
};

export default BatchList;
