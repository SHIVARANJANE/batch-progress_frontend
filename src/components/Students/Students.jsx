// Students.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentsTable from './StudentsTable';
import StudentFormModal from './StudentFormModal';
import './Students.css'; // New CSS file for styles
import StudentAttendanceModal from './StudentsAttendanceModal';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const Students = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/students`);
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      // Optionally show a toast for fetching error if needed
      toast.error('Failed to load students.');
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
        toast.success('Student updated successfully!'); // Success toast for update
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students`, payload);
        toast.success('Student added successfully!'); // Success toast for add
      }
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error('Failed to save student:', err.response?.data?.error || err.message);
      // Replace alert with toast.error
      toast.error(`Failed to save student: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/students/${id}`);
        fetchStudents(); // Refresh the list
        toast.success('Student deleted successfully!'); // Success toast for delete
      } catch (err) {
        console.error('Failed to delete student:', err);
        // Replace alert with toast.error
        toast.error('Failed to delete student.');
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
      <div className="students-header-container"> {/* New container for header and button */}
        <h2>📋 Registered Students</h2>
        <button className="back-button" onClick={() => navigate(getDashboardPath())}>
          ← Back to Dashboard
        </button>
      </div>
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
          // Pass editable prop if you want attendance to be markable from here
          editable={isAdminView}
          // The onAttendanceMarked prop in Students.jsx won't directly trigger a toast
          // unless you pass a function that then triggers it.
          // For now, the toast logic is self-contained within StudentAttendanceModal.jsx
          // as per the last modification. If you want a toast here as well,
          // you would need a handleAttendanceMarked function similar to the example in the previous turn.
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
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Students;