// Students.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentsTable from './StudentsTable';
import StudentFormModal from './StudentFormModal';
import './Students.css'; // New CSS file for styles
import StudentAttendanceModal from './StudentsAttendanceModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const role = localStorage.getItem('role');
  const isAdminView = role === 'admin';

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

  const handleSave = async (studentData) => {
    try {
      // Split top-level and enrollment fields
      const {
        name, email, mobile, regDate, vertical, domain, category,
        preferredFrequency, preferredDuration, preferredTimeSlot,
        breakDates, staffId, // `signature` removed
        enrollment // Enrollment object
      } = studentData;

      const payload = {
        name, email, mobile, regDate, vertical, domain, category,
        preferredFrequency, preferredDuration, preferredTimeSlot,
        breakDates, staffId,
        enrollment // Pass the entire enrollment object
      };

      if (editingStudent) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/students/${editingStudent._id}`, payload);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students`, payload);
      }
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error('Failed to save student:', err.response?.data?.error || err.message);
      alert(`Failed to save student: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/students/${id}`);
        fetchStudents(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete student:', err);
        alert('Failed to delete student.');
      }
    }
  };

  const handleEdit = (student) => {
    // Populate form with existing student and enrollment data
    const enrollment = student.enrollmentId;
    const initialData = {
      ...student,
      // Ensure courseName for individual courses is the ID if it's an object
      courseName: student.courseType === 'Individual' && enrollment?.courseId?._id ? enrollment.courseId._id : enrollment?.courseName || '',
      courseType: enrollment?.courseType || 'Individual',
      comboCourses: enrollment?.comboCourses || [],
      amount: enrollment?.amount || '',
      frequency: enrollment?.frequency || '',
      duration: enrollment?.duration || '',
      sessionLength: enrollment?.sessionLength || 1,
      startDate: enrollment?.startDate?.split('T')[0] || '',
      endDate: enrollment?.endDate?.split('T')[0] || '',
      paymentMode: enrollment?.paymentMode || 'Single',
      feeDetails: enrollment?.feeDetails?.length ? enrollment.feeDetails : [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
      installments: enrollment?.installments?.length ? enrollment.installments : [{ sno: 1, dueDate: '', amount: '', status: '' }]
    };

    setEditingStudent(initialData);
    setShowForm(true);
  };

  return (
    <div className="students-page">
      <h2>📋 Registered Students</h2>
      {isAdminView && (
        <button className="add-button" onClick={() => {
          setEditingStudent(null);
          setShowForm(true);
        }}>
          ➕ Add Student
        </button>
      )}

      <StudentsTable
        students={students}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdminView={isAdminView}
        onViewAttendance={setSelectedStudent}
      />
       {/* Show attendance modal if a student is selected */}
      {selectedStudent && (
        <StudentAttendanceModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      {showForm && (
        <StudentFormModal
          initialData={editingStudent}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default Students;