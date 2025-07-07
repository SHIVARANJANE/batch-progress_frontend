// components/UserManagementTab.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementTab.css'; // Create this CSS file

const UserManagementTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSuperAdminModal, setShowAddSuperAdminModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User being edited
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [addSuperAdminEmail, setAddSuperAdminEmail] = useState('');
  const [addSuperAdminPassword, setAddSuperAdminPassword] = useState('');
  const [addSuperAdminPhone, setAddSuperAdminPhone] = useState(''); // Added phone for new super admin

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setEditEmail(user.email);
    setEditPassword(''); // Never pre-fill password
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const updateData = {};
      if (editEmail !== currentUser.email) {
        updateData.email = editEmail;
      }
      if (editPassword) { // Only send password if it's changed/entered
        updateData.password = editPassword;
      }

      if (Object.keys(updateData).length === 0) {
        alert('No changes detected for update.');
        setShowEditModal(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/api/users/${currentUser._id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('User updated successfully!');
      setShowEditModal(false);
      fetchUsers(); // Re-fetch users to show updated data
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleAddSuperAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/users/super-admin`, {
        email: addSuperAdminEmail,
        password: addSuperAdminPassword,
        phone: addSuperAdminPhone, // Include phone
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Super Admin added successfully!');
      setShowAddSuperAdminModal(false);
      setAddSuperAdminEmail('');
      setAddSuperAdminPassword('');
      setAddSuperAdminPhone('');
      fetchUsers(); // Re-fetch users to show the new super admin
    } catch (err) {
      console.error('Error adding super admin:', err);
      setError(err.response?.data?.message || 'Failed to add Super Admin.');
    }
  };

  if (loading) {
    return <div className="user-management-container">Loading users...</div>;
  }

  if (error) {
    return <div className="user-management-container error-message">{error}</div>;
  }

  return (
    <div className="user-management-container">
      <h2>User Management</h2>

      <button className="add-super-admin-button" onClick={() => setShowAddSuperAdminModal(true)}>
        Add New Super Admin
      </button>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Associated Name</th>
              <th>Phone</th> {/* Added phone column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.associatedName || '-'}</td>
                <td>{user.phone || '-'}</td> {/* Display phone */}
                <td>
                  <button className="edit-button" onClick={() => handleEditClick(user)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit User: {currentUser.email}</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current):</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Super Admin Modal */}
      {showAddSuperAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Super Admin</h3>
            <form onSubmit={handleAddSuperAdmin}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={addSuperAdminEmail}
                  onChange={(e) => setAddSuperAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={addSuperAdminPassword}
                  onChange={(e) => setAddSuperAdminPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  value={addSuperAdminPhone}
                  onChange={(e) => setAddSuperAdminPhone(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button">Add Super Admin</button>
                <button type="button" className="cancel-button" onClick={() => setShowAddSuperAdminModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;
