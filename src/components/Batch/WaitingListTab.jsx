import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WaitingList = () => {
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWaitingList = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/batch/waiting-list`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    // Flatten the waiting list data
    const flatList=[];
    for (const batch of res.data) {
      for (const student of batch.waitingList) {
        flatList.push({
          batchId: batch._id,
          student: student.studentId,
          course: batch.courseId?.name,
          staff: student.staffId?.name,
          timeSlot: student.timeSlot,
          preferredTimeSlot: student.preferredTimeSlot,
          frequency: student.frequency,
          reason: student.reason,
        });
      }
    }
    setWaitingList(flatList);
  } catch (err) {
    console.error('Error fetching waiting list:', err);
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/approve-waiting/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchWaitingList();
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Approval failed.');
    }
  };

  const handleDisapprove = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/disapprove-waiting/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchWaitingList();
    } catch (err) {
      console.error('Disapproval failed:', err);
      alert('Disapproval failed.');
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading waiting list...</p>;

  return (
    <div className="grid gap-4">
      {waitingList.length === 0 ? (
        <div className="text-gray-500 text-center">🎉 No students in the waiting list.</div>
      ) : (
        waitingList.map((entry) => (
          <div
            key={`${entry.batchId}_${entry.student._id}`}
            className="bg-yellow-50 border border-yellow-300 p-4 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-bold text-yellow-800">{entry.student.name}</h3>
            <p><strong>Course:</strong> {entry.course}</p>
            <p><strong>Staff:</strong> {entry.staff}</p>
            <p><strong>Batch Slot:</strong> {entry.timeSlot}</p>
            <p><strong>Preferred Slot:</strong> {entry.preferredTimeSlot}</p>
            <p><strong>Frequency:</strong> {entry.frequency}</p>
            <p><strong>Reason:</strong> {entry.reason}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApprove(entry.batchId, entry.student._id)}
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleDisapprove(entry.batchId, entry.student._id)}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ❌ Disapprove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WaitingList;
