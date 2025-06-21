import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffForm.css';

const StaffForm = ({ onClose, onSubmit, staff }) => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    salary: '',
    isAdmin: false,
    courses: [''],
    workingHours: [{
      time: '',
      batchCode: '',
      startDate: '',
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
      completionDate: ''
    }]
  });

  useEffect(() => {
    if (staff) {
      // Ensure default structure even when editing
      setForm({
        ...staff,
        courses: staff.courses?.length ? staff.courses : [''],
        workingHours: staff.workingHours?.length ? staff.workingHours : [{
          time: '',
          batchCode: '',
          startDate: '',
          mon: '',
          tue: '',
          wed: '',
          thu: '',
          fri: '',
          sat: '',
          sun: '',
          completionDate: ''
        }]
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'isAdmin' ? value === 'true' : value });
  };

  const handleCourseChange = (index, value) => {
    const updated = [...form.courses];
    updated[index] = value;
    setForm({ ...form, courses: updated });
  };

  const addCourseField = () => {
    setForm({ ...form, courses: [...form.courses, ''] });
  };

  const handleWorkingHourChange = (index, e) => {
    const updated = [...form.workingHours];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, workingHours: updated });
  };

  const addWorkingHour = () => {
    setForm({
      ...form,
      workingHours: [...form.workingHours, {
        time: '',
        batchCode: '',
        startDate: '',
        mon: '',
        tue: '',
        wed: '',
        thu: '',
        fri: '',
        sat: '',
        sun: '',
        completionDate: ''
      }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🟢 handleSubmit triggered with data:', form);
    try {
      if (staff && staff._id) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/staff/${staff._id}`, form);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/staff`, form);
      }
      onSubmit();
    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <h3>{staff ? 'Edit Staff' : 'Add Staff'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="mobile" placeholder="Mobile No." value={form.mobile} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} required />

          <label>Is Admin:</label>
          <select name="isAdmin" value={form.isAdmin} onChange={handleChange}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>

          <hr />
          <h4>Courses</h4>
          {form.courses.map((course, index) => (
            <input
              key={index}
              placeholder={`Course ${index + 1}`}
              value={course}
              onChange={(e) => handleCourseChange(index, e.target.value)}
            />
          ))}
          <button type="button" onClick={addCourseField}>+ Add Course</button>

          <hr />
          <div className="working-hour-box">
            <h4>Working Hours</h4>
          {form.workingHours.map((wh, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '10px' }}>
              <input name="time" placeholder="Time" value={wh.time} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="batchCode" placeholder="Batch Code" value={wh.batchCode} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="startDate" placeholder="Start Date" value={wh.startDate} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="completionDate" placeholder="Completion Date" value={wh.completionDate} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="mon" placeholder="Mon" value={wh.mon} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="tue" placeholder="Tue" value={wh.tue} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="wed" placeholder="Wed" value={wh.wed} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="thu" placeholder="Thu" value={wh.thu} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="fri" placeholder="Fri" value={wh.fri} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="sat" placeholder="Sat" value={wh.sat} onChange={(e) => handleWorkingHourChange(index, e)} />
              <input name="sun" placeholder="Sun" value={wh.sun} onChange={(e) => handleWorkingHourChange(index, e)} />
            </div>
          ))}
          <button type="button" onClick={addWorkingHour}>+ Add Working Hour</button>
          </div>

          <div className="form-actions">
            <button type="submit">✅ Save</button>
            <button type="button" onClick={onClose}>❌ Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
