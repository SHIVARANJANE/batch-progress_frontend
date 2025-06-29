import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StaffForm from './StaffForm';
import StaffCompletionView from './StaffCompletionView';
import './StaffTab.css';

function StaffTab({ isAdminView = false }) {
  const [staffs, setStaffs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewAvailability, setViewAvailability] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showCompletionView, setShowCompletionView] = useState(false);

  const fetchStaffs = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/staff`);
    setStaffs(res.data);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/staff/${id}`);
    fetchStaffs();
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingStaff(null);
    fetchStaffs();
  };

  const handleViewAvailability = async (staff) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/staff/staff-occupancy/${staff._id}?view=availability`
      );
      setAvailabilityData(res.data.occupancy || []);
      console.log('Occupancy data received:', res.data.occupancy);
      setViewAvailability(staff);
    } catch (err) {
      console.error('Failed to fetch occupancy:', err);
    }
  };

  return (
    <div className="staff-tab">
      <h2>Staffs</h2>

      {!isAdminView && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          ＋
        </button>
      )}

      <h4 style={{ marginBottom: '10px' }}>
        🟡 Occupancy Score:{' '}
        {availabilityData && availabilityData.occupancyScore
          ? `${availabilityData.occupancyScore}%`
          : 'N/A'}
      </h4>

      <table>
        <thead>
          <tr>
            <th>S.no</th>
            <th>Staff Name</th>
            <th>Staff Email</th>
            <th>Availability</th>
            {!isAdminView && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {staffs.length > 0 ? (
            staffs.map((staff, idx) => (
              <tr key={staff._id}>
                <td>{idx + 1}</td>
                <td>{staff.name}</td>
                <td>{staff.email}</td>
                <td>
                  <button onClick={() => handleViewAvailability(staff)}>Click to view</button>
                </td>
                {!isAdminView && (
                  <td>
                    <button onClick={() => handleEdit(staff)}>✏️</button>
                    <button onClick={() => handleDelete(staff._id)}>🗑️</button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdminView ? 4 : 5} style={{ textAlign: 'center' }}>
                No staff data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!isAdminView && showForm && (
        <StaffForm
          onClose={() => {
            setShowForm(false);
            setEditingStaff(null);
          }}
          onSubmit={handleFormSubmit}
          staff={editingStaff}
        />
      )}

      {viewAvailability && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Availability for {viewAvailability.name}</h3>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th>Sat</th>
                  <th>Sun</th>
                </tr>
              </thead>
              <tbody>
                {availabilityData.length > 0 ? (
                  availabilityData.map((slot, idx) => (
                    <tr key={idx}>
                      <td>{slot.time}</td>
                      <td>{slot.mon || ''}</td>
                      <td>{slot.tue || ''}</td>
                      <td>{slot.wed || ''}</td>
                      <td>{slot.thu || ''}</td>
                      <td>{slot.fri || ''}</td>
                      <td>{slot.sat || ''}</td>
                      <td>{slot.sun || ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No availability data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <button onClick={() => setViewAvailability(null)}>Close</button>
          </div>
        </div>
      )}

      <button
        className="toggle-btn"
        onClick={() => setShowCompletionView((prev) => !prev)}
      >
        {showCompletionView ? '📉 Hide Completion Report' : '📊 Show Completion Report'}
      </button>

      {showCompletionView && <StaffCompletionView />}
    </div>
  );
}

export default StaffTab;
