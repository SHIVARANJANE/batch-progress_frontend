// src/pages/StaffTab.jsx
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
  const [showCompletionView, setShowCompletionView] = useState(false);

  const fetchStaffs = async () => {
    const res = await axios.get('http://localhost:5000/api/staff');
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
    await axios.delete(`http://localhost:5000/api/staff/${id}`);
    fetchStaffs();
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingStaff(null);
    fetchStaffs();
  };

  return (
    <div className="staff-tab">
      <h2>Staffs</h2>

      {/* Hide Add Button in Admin View */}
      {!isAdminView && (
        <button className="add-btn" onClick={() => setShowForm(true)}>＋</button>
      )}

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
          {staffs.map((staff, idx) => (
            <tr key={staff._id}>
              <td>{idx + 1}</td>
              <td>{staff.name}</td>
              <td>{staff.email}</td>
              <td>
                <button onClick={() => setViewAvailability(staff)}>Click to view</button>
              </td>
              {!isAdminView && (
                <td>
                  <button onClick={() => handleEdit(staff)}>✏️</button>
                  <button onClick={() => handleDelete(staff._id)}>🗑️</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form shown only in SuperAdmin mode */}
      {!isAdminView && showForm && (
        <StaffForm
          onClose={() => { setShowForm(false); setEditingStaff(null); }}
          onSubmit={handleFormSubmit}
          staff={editingStaff}
        />
      )}

      {/* View Availability Modal */}
      {viewAvailability && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Availability for {viewAvailability.name}</h3>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Batch Code</th>
                  <th>Start Date</th>
                  <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
                  <th>Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {(viewAvailability.workingHours || []).map((row, index) => (
                  <tr key={index} className={row.completionDate && new Date(row.completionDate) > new Date() ? 'delayed' : ''}>
                    <td>{row.time}</td>
                    <td>{row.batchCode}</td>
                    <td>{row.startDate}</td>
                    <td>{row.mon}</td><td>{row.tue}</td><td>{row.wed}</td><td>{row.thu}</td><td>{row.fri}</td><td>{row.sat}</td><td>{row.sun}</td>
                    <td>{row.completionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setViewAvailability(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Completion View for All */}
      <button className="toggle-btn" onClick={() => setShowCompletionView(prev => !prev)}>
        {showCompletionView ? '📉 Hide Completion Report' : '📊 Show Completion Report'}
      </button>

      {showCompletionView && <StaffCompletionView />}
    </div>
  );
}

export default StaffTab;
