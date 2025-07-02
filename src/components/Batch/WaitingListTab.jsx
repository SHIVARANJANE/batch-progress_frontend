import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WaitingListTab.css';

const WaitingList = () => {
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const role = localStorage.getItem('role');
  const isAdminOrSuperUser = role === 'admin' || role === 'super_user';

  const fetchWaitingList = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/batch/waiting-list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setWaitingList(res.data);
    } catch (err) {
      setErrorMsg('Error fetching waiting list');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (batchId, studentId) => {
    setErrorMsg('');
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
      // Show backend error (e.g. unpaid student)
      const msg = err?.response?.data?.message || 'Approval failed.';
      setErrorMsg(msg);
      alert(msg);
    }
  };

  const handleDisapprove = async (batchId, studentId) => {
    setErrorMsg('');
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
      // Optionally, you can also trigger a refresh of BatchList here if you lift state up
    } catch (err) {
      setErrorMsg('Disapproval failed.');
      alert('Disapproval failed.');
    }
  };

  useEffect(() => {
    if (isAdminOrSuperUser) fetchWaitingList();
    // eslint-disable-next-line
  }, [isAdminOrSuperUser]);

  if (!isAdminOrSuperUser) return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="waiting-list-container">
      {errorMsg && <div className="text-red-600 text-center">{errorMsg}</div>}
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
            <p><strong>Status:</strong> {entry.status}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApprove(entry.batchId, entry.student._id)}
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={entry.status !== 'admin_pending'}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleDisapprove(entry.batchId, entry.student._id)}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={entry.status !== 'admin_pending'}
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