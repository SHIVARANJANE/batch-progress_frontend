import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentsTable from './StudentsTable';
import StudentFormModal from './StudentFormModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      if (editingStudent?._id) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/students/${editingStudent._id}`, studentData);
        setShowForm(false);
        setEditingStudent(null);
        fetchStudents();
        return { success: true };
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/students`, studentData);
        setShowForm(false);
        setEditingStudent(null);
        fetchStudents();
        return res.data;
      }
    } catch (err) {
      console.error('Failed to save student:', err);
      alert('❌ Failed to save student.');
      throw err;
    }
  };

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

  const handleEdit = (student) => {
    const enrollment = student.enrollmentId || {};
    const initialData = {
      _id: student._id,
      name: student.name || '',
      email: student.email || '',
      mobile: student.mobile || '',
      regDate: student.regDate || '',
      vertical: student.vertical || '',
      domain: student.domain || '',
      category: student.category || '',
      signature: student.signature || '',
      breakDates: student.breakDates || [],
      preferredFrequency: student.preferredFrequency || '',
      preferredDuration: student.preferredDuration || '',
      preferredTimeSlot: student.preferredTimeSlot || '',
      courseType: enrollment.courseType || 'Individual',
      courseName: enrollment.courseId || enrollment.courseName || '',
      comboCourses: enrollment.comboCourses || [''],
      amount: enrollment.amount || '',
      frequency: enrollment.frequency || '',
      duration: enrollment.duration || '',
      sessionLength: enrollment.sessionLength || 1,
      startDate: enrollment.startDate?.split('T')[0] || '',
      endDate: enrollment.endDate?.split('T')[0] || '',
      paymentMode: enrollment.feeMode || 'Single',
      feeDetails: enrollment.feeDetails?.length ? enrollment.feeDetails : [{ sno: 1, date: '', receiptNo: '', amount: '', balance: '', status: '' }],
      installments: enrollment.installments?.length ? enrollment.installments : [{ sno: 1, dueDate: '', amount: '', status: '' }]
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
      />

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
