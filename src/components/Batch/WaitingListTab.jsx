import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WaitingListTab = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

 const fetchWaitingList = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token missing! Please login again.');
      return;
    }

    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/batch`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const batchesWithWaiting = res.data.filter(batch => batch.waitingList?.length > 0);
    setBatches(batchesWithWaiting);
  } catch (err) {
    console.error('Failed to load waiting list:', err);
    alert('Failed to fetch waiting list: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};


  const approveStudent = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/approve-waiting/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchWaitingList(); // refresh after update
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const disapproveStudent = async (batchId, studentId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/batch/${batchId}/disapprove-waiting/${studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchWaitingList(); // refresh after update
    } catch (err) {
      alert('Disapproval failed: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  if (loading) return <p>Loading waiting list...</p>;

  if (batches.length === 0) return <p>🎉 No students in the waiting list.</p>;

  return (
    <div>
      <h2>📋 Waiting List Review</h2>
      {batches.map(batch => (
        <div key={batch._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h4>📘 Course: {batch.courseId?.name || 'N/A'} | ⏱️ Time Slot: {batch.timeSlot || 'N/A'}</h4>
          <ul>
            {batch.waitingList.map(entry => (
              <li key={entry.studentId?._id || entry._id} style={{ marginBottom: '0.5rem' }}>
                👤 {entry.studentId?.name || 'Unnamed'} <br />
                🕓 Preferred Slot: {entry.preferredTimeSlot} | 📆 Frequency: {entry.frequency} <br />
                📝 Reason: {entry.reason} <br />
                <button onClick={() => approveStudent(batch._id, entry.studentId._id)}>✅ Approve</button>{' '}
                <button onClick={() => disapproveStudent(batch._id, entry.studentId._id)}>❌ Disapprove</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default WaitingListTab;
