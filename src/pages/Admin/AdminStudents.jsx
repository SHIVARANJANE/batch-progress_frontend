import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentsTable from '../components/StudentsTable';
import StudentAttendanceModal from '../components/StudentAttendanceModal';
import StudentFormModal from '../components/StudentFormModal';
import './AdminStudents.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

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

  const handleAdd = () => {
    setEditStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/students/${id}`);
        fetchStudents();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleFormSave = async (formData) => {
    try {
      if (editStudent) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/students/${editStudent._id}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students`, formData);
      }
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <div className="students-page">
      <h2>🎓 Manage Students</h2>
      <button className="add-btn" onClick={handleAdd}>➕ Add Student</button>

      <StudentsTable
        students={students}
        onViewAttendance={setSelectedStudent}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdminView={true} // pass flag to show edit/delete buttons
      />

      {selectedStudent && (
        <StudentAttendanceModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {showForm && (
        <StudentFormModal
          initialData={editStudent}
          onSave={handleFormSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AdminStudents;
