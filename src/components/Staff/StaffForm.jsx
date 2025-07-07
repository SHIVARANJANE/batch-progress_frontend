import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffForm.css';

const TIME_SLOTS = [
  '10:30-11:30', '11:30-12:30', '02:00-03:00',
  '03:00-04:00', '04:00-05:00', '05:00-06:00',
  '06:00-07:00', '07:00-08:00'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Define the frequency options
const FREQUENCY_OPTIONS = ['daily', 'alternatedays', 'weekend', 'only sunday'];

// Add isAdminEditing prop
const StaffForm = ({ onClose, onSubmit, staff, isAdminEditing = false }) => { // Added isAdminEditing prop with default false
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    salary: '',
    role: 'staff',
    isAdmin: false,
    staffType: 'Full-time',
    courses: [''],
    status: 'active',
    expertise: '',
    maxHoursPerDay: 8,
    workingDays: [],
    availability: {},
    frequency: 'daily'
  });

  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`)
      .then(res => setCourseOptions(res.data))
      .catch(err => console.error('Failed to fetch courses', err));
  }, []);

  useEffect(() => {
    if (staff) {
      setForm({
        ...form,
        ...staff,
        courses: staff.courses?.length ? staff.courses.map(c => (typeof c === 'object' ? c._id : c)) : [''],
        workingDays: staff.workingDays || [],
        availability: staff.availability || {},
        isAdmin: !!staff.isAdmin,
        staffType: staff.staffType || 'Full-time',
        frequency: staff.frequency || 'daily'
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'isAdmin' ? value === 'true' : value
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const toggleAvailability = (day, slot) => {
    const current = form.availability[day] || [];
    const updatedSlots = current.includes(slot)
      ? current.filter(s => s !== slot)
      : [...current, slot];

    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: updatedSlots
      }
    }));
  };

  const handleCourseChange = (index, value) => {
    const updated = [...form.courses];
    updated[index] = value;
    setForm({ ...form, courses: updated });
  };

  const addCourseField = () => {
    setForm({ ...form, courses: [...form.courses, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        courses: form.courses.filter(id => id), // remove empty
        isAdmin: Boolean(form.isAdmin),
        maxHoursPerDay: Number(form.maxHoursPerDay),
        salary: Number(form.salary),
      };

      if (staff && staff._id) {
        // If it's an admin editing, only send the editable fields
        if (isAdminEditing) {
          const adminEditablePayload = {
            staffType: payload.staffType,
            status: payload.status,
            frequency: payload.frequency,
            maxHoursPerDay: payload.maxHoursPerDay,
            workingDays: payload.workingDays,
            availability: payload.availability,
            courses: payload.courses,
          };
          await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/staff/${staff._id}`, adminEditablePayload);
        } else {
          // Full payload for super admin or new staff creation
          await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/staff/${staff._id}`, payload);
        }
      } else {
        // For new staff creation, always send full payload
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/staff`, payload);
      }
      onSubmit();
    } catch (err) {
      console.error('Error submitting staff:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <h3>{staff ? (isAdminEditing ? 'Edit Staff Availability' : 'Edit Staff') : 'Add Staff'}</h3>
        <form onSubmit={handleSubmit}>
          {/* Personal Details - Conditionally disabled/hidden for admin editing */}
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required disabled={isAdminEditing} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={isAdminEditing} />
          <input name="mobile" placeholder="Mobile No." value={form.mobile} onChange={handleChange} required disabled={isAdminEditing} />
          <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required={!staff && !isAdminEditing} disabled={isAdminEditing} /> {/* Password required only for new staff, and not for admin editing */}
          <input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} required /* REMOVED disabled={isAdminEditing} */ /> {/* */}
          <input name="expertise" placeholder="Expertise" value={form.expertise} onChange={handleChange} disabled={isAdminEditing} />

          <label>Is Admin?</label>
          <select name="isAdmin" value={form.isAdmin} onChange={handleChange} disabled={isAdminEditing}>
            <option value={false}>No</option>
            <option value={true}>Yes</option>
          </select>

          {/* Staff Type and below - always editable */}
          <label>Staff Type</label>
          <select name="staffType" value={form.staffType} onChange={handleChange}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>

          <label>Frequency</label>
          <select name="frequency" value={form.frequency} onChange={handleChange}>
            {FREQUENCY_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace('days', ' Days')}
              </option>
            ))}
          </select>

          <label>Max Hours Per Day</label>
          <input
            name="maxHoursPerDay"
            type="number"
            min="1"
            max="8"
            value={form.maxHoursPerDay}
            onChange={handleChange}
          />

          <label>Status</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={form.status === 'active'}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  status: prev.status === 'active' ? 'inactive' : 'active',
                }))
              }
            />
            <span>{form.status === 'active' ? 'Active' : 'Inactive'}</span>
          </div>

          <hr />
          <h4>Courses</h4>
          {form.courses.map((course, i) => (
            <select
              key={i}
              value={course}
              onChange={(e) => handleCourseChange(i, e.target.value)}
              required
            >
              <option value="">Select a Course</option>
              {courseOptions.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          ))}
          <button type="button" onClick={addCourseField}>+ Add Course</button>

          <hr />
          <h4>Working Days</h4>
          <div className="days-checkboxes">
            {DAYS.map(day => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={form.workingDays.includes(day)}
                  onChange={() => toggleWorkingDay(day)}
                /> {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>

          <hr />
          <h4>Availability per Time Slot</h4>
          {DAYS.map(day => (
            <div key={day}>
              <strong>{day.charAt(0).toUpperCase() + day.slice(1)}</strong>
              <div className="slot-grid">
                {TIME_SLOTS.map(slot => (
                  <label key={slot}>
                    <input
                      type="checkbox"
                      checked={form.availability[day]?.includes(slot) || false}
                      onChange={() => toggleAvailability(day, slot)}
                    /> {slot}
                  </label>
                ))}
              </div>
            </div>
          ))}

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