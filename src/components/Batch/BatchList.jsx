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

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="grid gap-4">
      {batches.map((batch) => (
        <div key={batch._id} className="bg-white border p-4 rounded shadow">
          <h3 className="font-bold text-lg">{batch.courseId?.name || 'Unnamed Course'}</h3>
          <p><strong>Staff:</strong> {batch.staffId?.name || 'Unassigned'}</p>
          <p><strong>Batch Slot:</strong> {batch.timeSlot}</p>
          <p><strong>Frequency:</strong> {batch.frequency}</p>
          <p><strong>Students:</strong> {batch.studentIds?.length} / {batch.maxStudents}</p>
          <div>
            <h4 className="font-semibold">Students:</h4>
            <ul>
              {(batch.studentIds || []).map(student => (
                <li key={student._id} className="flex items-center gap-2">
                  {student.name} | Frequency: {student.frequency} | Start: {student.startDate} | End: {student.endDate}
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => markStudentComplete(batch._id, student._id)}
                  >
                    Mark Complete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BatchList;