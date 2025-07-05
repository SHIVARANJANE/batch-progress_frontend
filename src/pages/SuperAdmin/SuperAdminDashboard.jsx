// SuperAdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminDashboard.css';
import {FaBell, FaUserCircle} from 'react-icons/fa';

function SuperAdminDashboard() {
    const navigate =useNavigate();
    const[showNotifications,setNotifications]=useState(false);
    const[showProfile,setShowProfile]=useState(false);
    const notifications=[
        "3 students enrolled in Course A",
        "Batch B is delayed",
        "new course added: Course C"
    ];

    return(
        <div className="dashboard-container">
            <div className='top-bar'>
                <div className='icon-wrapper' onClick={()=> {setNotifications(!showNotifications); setShowProfile(false)}}>
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
            <div className='icon-wrapper' onClick={()=> {setShowProfile(!showProfile); setNotifications(false)}}>
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
        <div className='dashboard-section' onClick={() => navigate('/courses')}>
            <span>Courses</span><span className="arrow">→</span>
        </div>
        <div className='dashboard-section' onClick={() => navigate('/staff')}>
            <span>Staff</span><span className="arrow">→</span>
        </div>
        <div className='dashboard-section' onClick={() => navigate('/students')}>
            <span>Students</span><span className="arrow">→</span>
        </div>
        {/* New Batch Section */}
        <div className='dashboard-section' onClick={() => navigate('/batches')}>
            <span>Batches</span><span className="arrow">→</span>
        </div>
    </div>
    );
}
export default SuperAdminDashboard;