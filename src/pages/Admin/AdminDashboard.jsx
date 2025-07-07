// AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import StaffTab from '../../components/Staff/StaffTab'; // Assuming this path is correct
import BatchList from '../../components/Batches/BatchList'; // <--- ADD THIS LINE
import './AdminDashboard.css'; // Assuming you have a CSS file for styling
function AdminDashboard() {
    const navigate = useNavigate();
    const [showNotifications, setNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [viewing, setViewing] = useState('dashboard'); // 'dashboard', 'staff', 'batches'

    const notifications = [
        "3 students enrolled in Course A",
        "Batch B is delayed",
        "New course added: Course C"
    ];

    // Helper to get the correct dashboard path (for the back button in sub-views)
    // This function is primarily used by components that are standalone pages,
    // not typically by AdminDashboard itself to navigate to its sub-views.
    // However, it's good to keep it for consistency if needed elsewhere.
    const getDashboardPath = () => {
      const userRole = localStorage.getItem('role');
      switch (userRole) {
        case 'super_user':
          return '/SuperAdminDashboard';
        case 'admin':
          return '/AdminDashboard'; // Admin's own dashboard
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
                            <p>Role: Admin</p>
                            <button onClick={() => {
                                localStorage.clear();
                                navigate('/');
                            }}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            <h1>Admin Dashboard</h1>

            {viewing === 'dashboard' && (
                <>
                    <div className='dashboard-section' onClick={() => navigate('/courses')}>
                        <span>Courses</span><span className="arrow">→</span>
                    </div>
                    <div className='dashboard-section' onClick={() => setViewing('staff')}>
                        <span>Staff</span><span className="arrow">→</span>
                    </div>
                    <div className='dashboard-section' onClick={() => navigate('/students')}>
                        <span>Students</span><span className="arrow">→</span>
                    </div>
                    {/* New Batch Section */}
                    <div className='dashboard-section' onClick={() => setViewing('batches')}> {/* Changed navigate to setViewing here */}
                        <span>Batches</span><span className="arrow">→</span>
                    </div>
                </>
            )}

            {viewing === 'staff' && (
                <div>
                    {/* Changed to setViewing('dashboard') to go back to Admin Dashboard overview */}
                    <button className="back-button" onClick={() => setViewing('dashboard')}>← Back to Dashboard</button>
                    <StaffTab isAdminView={true} />
                </div>
            )}

            {/* New Batches View */}
            {viewing === 'batches' && (
                <div>
                    {/* Changed to setViewing('dashboard') to go back to Admin Dashboard overview */}
                    <button className="back-button" onClick={() => setViewing('dashboard')}>← Back to Dashboard</button>
                    {/* Render BatchList for admin view */}
                    <BatchList isAdminView={true} />
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
