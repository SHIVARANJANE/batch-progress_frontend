import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Login/Home";
import Login from "./pages/Login/Login";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Courses from "./components/Course/Courses";
import StaffTab from "./components/Staff/StaffTab";
import Students from "./components/Students/Students";
import BatchList from "./components/Batches/BatchList";
import StudentFormModal from "./components/Students/StudentFormModal";
import UserManagementTab from "./components/UserManagementTab";
function App() {
    const [token, setToken] = useState(localStorage.getItem('token')); // State to hold the token

    // Listen for changes in localStorage (e.g., after login/logout)
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
                    <Route path="/usermanagement" element={<UserManagementTab token={token} />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/staff" element={<StaffTab />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/StudentFormModal" element={<StudentFormModal />} />
                    <Route path="/batches" element={<BatchList isAdminView={true} />} />
                    <Route path="/StaffDashboard" element={<StaffDashboard />} />
                    <Route path="/StudentDashboard" element={<StudentDashboard studentId={localStorage.getItem('studentId')} />} />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
