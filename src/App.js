import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Login/Home";
import Login from "./pages/Login/Login";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Courses from "./components/Courses";
import StaffTab from "./components/StaffTab";
import Students from "./components/Students";
import BatchTab from "./components/BatchTab";
import StudentFormModal from "./components/StudentFormModal";
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
                    <Route path="/batches" element={<BatchTab />} />
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/StudentFormModal" element={<StudentFormModal />} />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
