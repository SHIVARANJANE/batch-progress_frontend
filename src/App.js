import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Login/Home";
import Login from "./pages/Login/Login";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Courses from "./components/Course/Courses";
import StaffTab from "./components/Staff/StaffTab";
import Students from "./components/Students/Students";
import BatchTab from "./components/Batch/BatchTab";
import StudentFormModal from "./components/Students/StudentFormModal";
function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/staff" element={<StaffTab />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/StudentFormModal" element={<StudentFormModal />} />
                    <Route path="/batches" element={<BatchTab />} />
                    <Route path="/StaffDashboard" element={<StaffDashboard />} />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
