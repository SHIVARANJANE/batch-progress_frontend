// src/pages/Students.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentsTable from '../components/StudentsTable';
import StudentAttendanceModal from '../components/StudentAttendanceModal';
import StudentFormModal from '../components/StudentFormModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const role = localStorage.getItem('role'); 
  const isAdminView = role === 'admin';
  console.log('User role:', role);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle Add/Edit Save
  const handleSave = async (studentData) => {
    try {
      if (editingStudent) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/students/${editingStudent._id}`, studentData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students`, studentData);
      }
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error('Failed to delete student:', err);
      }
    }
  };

  return (
    <div className="students-page">
      <h2>📋 Registered Students</h2>
      {isAdminView && (
        <button className="add-button" onClick={() => { setEditingStudent(null); setShowForm(true); }}>
          ➕ Add Student
        </button>
      )}

      <StudentsTable
        students={students}
        onViewAttendance={setSelectedStudent}
        onEdit={(student) => { setEditingStudent(student); setShowForm(true); }}
        onDelete={handleDelete}
        isAdminView={isAdminView}
      />


      {selectedStudent && (
        <StudentAttendanceModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {showForm && (
        <StudentFormModal
          initialData={editingStudent}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingStudent(null); }}
        />
      )}
    </div>
  );
};

export default Students;
