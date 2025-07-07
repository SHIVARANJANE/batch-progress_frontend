import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseTable from "./CourseTable";
import CourseForm from "./CourseForm";
import './Courses.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Courses() {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVertical, setFilterVertical] = useState('');
  const role = localStorage.getItem('role');
  const isAdminView = role === 'admin';
  const navigate = useNavigate(); // Initialize useNavigate

  // Helper to get the correct dashboard path
  const getDashboardPath = () => {
    const userRole = localStorage.getItem('role');
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleAddClick = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleSaveCourse = async (formData) => {
    try {
      if (editingCourse) {
        const res = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${editingCourse._id}`, formData);
        setCourses(courses.map(course =>
          course._id === editingCourse._id ? res.data : course
        ));
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, formData);
        setCourses([...courses, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error("❌ Save failed:", err);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${id}`);
        setCourses(courses.filter((c) => c._id !== id));
      } catch (err) {
        console.error("❌ Delete failed:", err);
      }
      setShowForm(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVertical = filterVertical
      ? course.vertical?.toLowerCase() === filterVertical.toLowerCase()
      : true;
    return matchesSearch && matchesVertical;
  });

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>📚 Course List</h2>
        <button className="back-button" onClick={() => navigate(getDashboardPath())}>
          ← Back to Dashboard
        </button>
        {isAdminView && (
          <button className="add-course-btn" onClick={handleAddClick}>
            ➕ Add Course
          </button>
        )}
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by course name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterVertical} onChange={(e) => setFilterVertical(e.target.value)}>
          <option value="">All Verticals</option>
          <option value="Cadd">Cadd</option>
          <option value="LiveWire">LiveWire</option>
          <option value="Synergy">Synergy</option>
        </select>
      </div>

      <CourseTable
        courses={filteredCourses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdminView={isAdminView}
      />

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CourseForm
              onSave={handleSaveCourse}
              onDelete={() => handleDelete(editingCourse?._id)}
              onCancel={() => setShowForm(false)}
              initialData={editingCourse}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
