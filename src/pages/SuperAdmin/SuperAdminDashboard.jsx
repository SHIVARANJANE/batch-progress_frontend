// SuperAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminDashboard.css';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import UserManagementTab from '../../components/UserManagementTab'; // Import the new component

function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [showNotifications, setNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedTab, setSelectedTab] = useState('dashboard'); // New state for tabs
    const notifications = [
        "3 students enrolled in Course A",
        "Batch B is delayed",
        "new course added: Course C"
    ];

    const token = localStorage.getItem('token'); // Get token from localStorage

    // Effect to check user role from token (optional, but good for robust dashboards)
    useEffect(() => {
        // You might want to decode the token here or fetch user role
        // For simplicity, assuming the user is indeed a Super Admin to view this dashboard
        if (!token) {
            navigate('/'); // Redirect to login if no token
        }
    }, [token, navigate]);

    // Helper to get the correct dashboard path (for the back button in sub-views)
    const getDashboardPath = () => {
      const userRole = localStorage.getItem('role');
      switch (userRole) {
        case 'super_user':
          return '/SuperAdminDashboard'; // Super Admin's own dashboard
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

    return (
        <div className="dashboard-container">
            <div className='top-bar'>
                <div className='icon-wrapper' onClick={() => { setNotifications(!showNotifications); setShowProfile(false) }}>
                    <FaBell className='icon' />
                    <span className='notification-dot'></span>
                    {showNotifications && (
                        <div className='dropdown notifications'>
                            <h4>Notifications</h4>
                            <ul>
                                {notifications.map((notification, index) => (
                                    <li key={index}>{notification}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className='icon-wrapper' onClick={() => { setShowProfile(!showProfile); setNotifications(false) }}>
                    <FaUserCircle className='icon' />
                    {showProfile && (
                        <div className='dropdown profile'>
                            <h4>Profile</h4>
                            <p>Email: {localStorage.getItem('email') || 'Unknown'}</p>
                            <p>Role: Super Admin</p>
                            <button onClick={() => {
                                localStorage.clear();
                                navigate('/');
                            }}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
            <h1>Super Admin Dashboard</h1>

            {/* Tab Navigation */}
            <div className="dashboard-tabs-container">
                <button
                    className={`dashboard-tab-button ${selectedTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('dashboard')}
                >
                    Overview
                </button>
                <button
                    className={`dashboard-tab-button ${selectedTab === 'userManagement' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('userManagement')}
                >
                    User Management
                </button>
                {/* Add more tabs here if needed */}
            </div>

            {/* Tab Content */}
            <div className="dashboard-content-area">
                {selectedTab === 'dashboard' && (
                    <>
                        <div className='dashboard-section' onClick={() => navigate('/courses')}>
                            <span>Courses</span><span className="arrow">→</span>
                        </div>
                        <div className='dashboard-section' onClick={() => navigate('/staff')}>
                            <span>Staff</span><span className="arrow">→</span>
                        </div>
                        <div className='dashboard-section' onClick={() => navigate('/students')}>
                            <span>Students</span><span className="arrow">→</span>
                        </div>
                        <div className='dashboard-section' onClick={() => navigate('/batches')}>
                            <span>Batches</span><span className="arrow">→</span>
                        </div>
                    </>
                )}

                {selectedTab === 'userManagement' && (
                    <>
                        {/* Back button for User Management tab */}
                        <button className="back-button" onClick={() => navigate(getDashboardPath())}>
                            ← Back to Dashboard
                        </button>
                        <UserManagementTab token={token} />
                    </>
                )}
            </div>
        </div>
    );
}
export default SuperAdminDashboard;
