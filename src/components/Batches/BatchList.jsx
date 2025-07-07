// src/components/Batches/BatchList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BatchList.css'; // Create this CSS file for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const BatchList = ({ staffId, isAdminView }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({ visible: false, type: '', message: '' }); // State for popups
  const navigate = useNavigate(); // Initialize useNavigate

  // Helper to get the correct dashboard path
  const getDashboardPath = () => {
    const userRole = localStorage.getItem('role');
    switch (userRole) {
      case 'super_user':
        return '/SuperAdminDashboard';
      case 'admin':
        return '/AdminDashboard';
      case 'staff':
        return '/StaffDashboard';
      case 'student':
        return '/StudentDashboard';
      default:
        return '/'; // Default to home/login
    }
  };

  // Function to show UI popups
  const showUIPopup = (type, message) => {
    setPopup({ visible: true, type, message });
    setTimeout(() => {
      setPopup({ visible: false, type: '', message: '' });
    }, 4000); // Popup disappears after 4 seconds
  };

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

  useEffect(() => {
    fetchBatches();
  }, [staffId, isAdminView]); // Re-fetch if staffId or view type changes

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/batches/${batchId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showUIPopup('success', 'Batch deleted successfully!');
        // Re-fetch batches to update the list
        fetchBatches();
      } catch (err) {
        console.error('Error deleting batch:', err);
        showUIPopup('error', err.response?.data?.message || 'Failed to delete batch.');
      }
    }
  };

  const handleMarkComplete = async (batchId, studentId, studentName) => {
    if (window.confirm(`Are you sure you want to mark ${studentName} as complete and remove them from this batch?`)) {
      try {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/batches/${batchId}/removeStudent/${studentId}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showUIPopup('success', `${studentName} successfully marked complete and removed from batch.`);
        fetchBatches(); // Re-fetch batches to update the UI
      } catch (err) {
        console.error('Error marking student complete:', err);
        showUIPopup('error', err.response?.data?.message || 'Failed to mark student complete.');
      }
    }
  };

  // Get user role once to use in conditional rendering
  const userRole = localStorage.getItem('role');

  if (loading) {
    return <div className="loading-message">Loading batches...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (batches.length === 0) {
    return (
      <div className="batch-list-container">
        <div className="batch-list-header">
          <h3>{isAdminView ? 'All Batches' : 'My Batches'}</h3>
          {/* Conditionally render back button only if not in admin view AND not staff */}
          {!isAdminView && userRole !== 'staff' && (
            <button className="back-button" onClick={() => navigate(getDashboardPath())}>
              ← Back to Dashboard
            </button>
          )}
        </div>
        <div className="no-data-message">No batches found for this view.</div>
      </div>
    );
  }

  return (
    <div className="batch-list-container">
      <div className="batch-list-header">
        <h3>{isAdminView ? 'All Batches' : 'My Batches'}</h3>
        {/* Conditionally render back button only if not in admin view AND not staff */}
        {!isAdminView && userRole !== 'staff' && (
          <button className="back-button" onClick={() => navigate(getDashboardPath())}>
            ← Back to Dashboard
          </button>
        )}
      </div>
      {batches.map(batch => (
        <div key={batch._id} className="batch-card">
          <div className="batch-header">
            <h4>Course: {batch.courseId?.name || 'N/A'}</h4>
            {isAdminView && <p>Staff: {batch.staffId?.name || 'N/A'}</p>}
            <p className="batch-occupancy">
              Occupancy:
              {batch.students ? `${batch.students.length}/${batch.maxStudents}` : `0/${batch.maxStudents}`}
            </p>
          </div>
          <p>Time Slot: {batch.slotTiming}</p>
          <h5>Students:</h5>
          {batch.students && batch.students.length > 0 ? (
            <ul className="student-list">
              {batch.students.map(student => (
                <li key={student._id} className="student-list-item"> {/* Added class for potential styling */}
                  {student.name} ({student.email || student.mobile || 'N/A'})
                  {userRole === 'staff' && (
                    <button
                      className="mark-complete-button"
                      onClick={() => handleMarkComplete(batch._id, student._id, student.name)}
                    >
                      Mark Complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No students in this batch yet.</p>
          )}
          {isAdminView && (
            <button
              onClick={() => handleDeleteBatch(batch._id)}
              className="delete-batch-button" // Add a CSS class for styling
            >
              Delete Batch
            </button>
          )}
        </div>
      ))}
      {/* Render the PopupComponent (assuming it's available or define it here) */}
      {popup.visible && (
        <PopupComponent type={popup.type} message={popup.message} onClose={() => setPopup({ visible: false })} />
      )}
    </div>
  );
};

// Basic Popup Component (Copied from StudentFormModal.jsx for self-containment)
const PopupComponent = ({ type, message, onClose }) => {
  let backgroundColor = '';
  let borderColor = '';
  switch (type) {
    case 'success':
      backgroundColor = 'rgba(144, 238, 144, 0.9)'; // lightgreen with opacity
      borderColor = 'green';
      break;
    case 'error':
      backgroundColor = 'rgba(240, 128, 128, 0.9)'; // lightcoral with opacity
      borderColor = 'red';
      break;
    case 'info':
      backgroundColor = 'rgba(173, 216, 230, 0.9)'; // lightblue with opacity
      borderColor = 'steelblue';
      break;
    default:
      backgroundColor = 'rgba(255, 255, 204, 0.9)'; // lightyellow with opacity
      borderColor = 'orange';
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 25px',
      backgroundColor: backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: '#333',
      fontSize: '16px',
      fontWeight: 'bold',
      animation: 'fadeInOut 4s forwards' // Basic animation
    }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: '15px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#333',
          fontWeight: 'bold'
        }}
      >
        &times;
      </button>
      <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
            `}</style>
    </div>
  );
};


export default BatchList;