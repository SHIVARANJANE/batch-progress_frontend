import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StaffForm from './StaffForm';
import './StaffTab.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function StaffTab({ isAdminView = false }) {
  const [staffs, setStaffs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewAvailability, setViewAvailability] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [showCompletionView, setShowCompletionView] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const userRole = localStorage.getItem('role'); // Get user role

  // Helper to get the correct dashboard path
  const getDashboardPath = () => {
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

  const fetchStaffs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/staff`);
      setStaffs(res.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff?')) {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/staff/${id}`);
      fetchStaffs();
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingStaff(null);
    fetchStaffs();
  };

  const handleViewAvailability = async (staff) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/staff/staff-occupancy/${staff._id}?view=availability`
      );
      setAvailabilityData(res.data || []);
      setViewAvailability(staff);
    } catch (err) {
      console.error('Failed to fetch occupancy:', err);
    }
  };

  // Determine if the current user is an admin
  const isCurrentUserAdmin = userRole === 'admin';
  const isCurrentUserSuperAdmin = userRole === 'super_user';


  return (
    <div className="staff-tab">
      {/* Header Section with Add + Completion Button */}
      <div className="staff-header">
        <h2>👩‍🏫 Staff Directory</h2>
        {/* Conditionally render back button only if not in admin view (meaning it's super admin view or staff/student) */}
        {!isAdminView && ( // This prop isAdminView typically means it's for the admin dashboard, where 'Add Staff' and 'Edit/Delete' are available
          <button className="back-button" onClick={() => navigate(getDashboardPath())}>
            ← Back to Dashboard
          </button>
        )}
        <div className="header-actions">
          {/* Only Super Admin can add staff */}
          {isCurrentUserSuperAdmin && (
            <button className="add-btn" onClick={() => setShowForm(true)}>
              ➕ Add Staff
            </button>
          )}
        </div>
      </div>

      {/* Staff Card Grid */}
      <div className="staff-card-container">
        {staffs.length > 0 ? (
          staffs.map((staff) => (
            <div key={staff._id} className="staff-card">
              <div className="staff-info">
                <h4>{staff.name}</h4>
                <p>{staff.email}</p>
              </div>
              <div className="staff-actions">
                <button onClick={() => handleViewAvailability(staff)}>📅 View Availability</button>
                {/* Edit button: Super admin can edit everything, Admin can edit working hours/availability */}
                {(isCurrentUserSuperAdmin || isCurrentUserAdmin) && (
                  <button onClick={() => handleEdit(staff)}>✏️ Edit</button>
                )}
                {/* Delete button: Only Super Admin can delete */}
                {isCurrentUserSuperAdmin && (
                  <button onClick={() => handleDelete(staff._id)}>🗑️ Delete</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-data-msg">No staff members found.</p>
        )}
      </div>

      {/* Staff Form Modal */}
      {showForm && (isCurrentUserSuperAdmin || (isCurrentUserAdmin && editingStaff)) && ( // Show form if super admin or admin editing an existing staff
        <StaffForm
          onClose={() => {
            setShowForm(false);
            setEditingStaff(null);
          }}
          onSubmit={handleFormSubmit}
          staff={editingStaff}
          isAdminEditing={isCurrentUserAdmin && editingStaff !== null} // Pass isAdminEditing prop
        />
      )}

      {/* Availability Modal */}
      {viewAvailability && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📆 Availability for {viewAvailability.name}</h3>
            <div className="table-wrapper">
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
                        <td>{slot.mon || '-'}</td>
                        <td>{slot.tue || '-'}</td>
                        <td>{slot.wed || '-'}</td>
                        <td>{slot.thu || '-'}</td>
                        <td>{slot.fri || '-'}</td>
                        <td>{slot.sat || '-'}</td>
                        <td>{slot.sun || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center' }}>
                        No availability data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button className="close-btn" onClick={() => setViewAvailability(null)}>
              ❌ Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default StaffTab;