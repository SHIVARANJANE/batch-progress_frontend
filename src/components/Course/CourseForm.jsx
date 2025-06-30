import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import './CourseForm.css';

function CourseForm({ onSave, onDelete, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    vertical: '',
    domain: '',
    category: '',
    courseType: 'Individual',
    name: '',
    comboCourses: [''],
    duration: '',
    fees: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        vertical: initialData.vertical,
        domain: initialData.domain,
        category: initialData.category,
        courseType: initialData.courseType || 'Individual',
        name: initialData.name || '',
        comboCourses: initialData.comboCourses || [''],
        duration: initialData.duration,
        fees: initialData.fees,
        _id: initialData._id,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vertical') {
      setFormData({ ...formData, vertical: value, domain: '', category: '', name: '', comboCourses: [''] });
    } else if (name === 'domain') {
      setFormData({ ...formData, domain: value, category: '', name: '', comboCourses: [''] });
    } else if (name === 'category') {
      setFormData({ ...formData, category: value, name: '', comboCourses: [''] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleComboChange = (index, value) => {
    const updated = [...formData.comboCourses];
    updated[index] = value;
    setFormData({ ...formData, comboCourses: updated });
  };

  const addComboCourse = () => {
    if (formData.comboCourses.length < 10) {
      setFormData({ ...formData, comboCourses: [...formData.comboCourses, ''] });
    }
  };

  const removeComboCourse = (index) => {
    const updated = [...formData.comboCourses];
    updated.splice(index, 1);
    setFormData({ ...formData, comboCourses: updated });
  };

  const handleSubmit = () => {
    const { vertical, domain, category, courseType, duration, fees } = formData;

    if (!vertical || !domain || !category || !duration || !fees || !courseType) {
      alert("Please fill all fields");
      return;
    }

    if (courseType === 'Individual') {
      if (!formData.name) {
        alert("Please enter a course name");
        return;
      }
      onSave(formData);
    } else {
      const validCourses = formData.comboCourses.filter(c => c);
      if (validCourses.length < 2) {
        alert("Please add at least two combo courses");
        return;
      }
      onSave({ ...formData, name: '', comboCourses: validCourses });
    }
  };

  // Options
  const domainOptions = {
    Cadd: ['Mechanical/Mechatronics', 'Civil', 'Architecture', 'Electrical'],
    Livewire: ['CS/IT'],
    Synergy: ['Project Management', 'BA Taxation', 'Office'],
  };

  const categoryOptions = {
    'Mechanical/Mechatronics': ['AutoCAD2D', 'Catia'],
    Civil: ['AutoCAD', 'BIM'],
    Architecture: ['Vray', 'Lumion'],
    Electrical: ['IOT', 'Lighting Design'],
    'CS/IT': ['Python', 'Java', 'C', 'C++'],
    'Project Management': ['PMP', 'Power BI'],
  };

  return (
    <div className="course-form">
      <h3>{initialData ? "✏️ Edit Course" : "➕ Add New Course"}</h3>

      <div className="form-grid">
        <select name="vertical" value={formData.vertical} onChange={handleChange}>
          <option value="">Select Vertical</option>
          <option value="Cadd">Cadd</option>
          <option value="Livewire">Livewire</option>
          <option value="Synergy">Synergy</option>
        </select>

        <select name="domain" value={formData.domain} onChange={handleChange} disabled={!formData.vertical}>
          <option value="">Select Domain</option>
          {domainOptions[formData.vertical]?.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>

        <select name="category" value={formData.category} onChange={handleChange} disabled={!formData.domain}>
          <option value="">Select Category</option>
          {categoryOptions[formData.domain]?.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select name="courseType" value={formData.courseType} onChange={(e) =>
          setFormData({
            ...formData,
            courseType: e.target.value,
            name: '',
            comboCourses: [''],
          })
        }>
          <option value="Individual">Individual Course</option>
          <option value="Combo">Combo Course</option>
        </select>
      </div>

      {formData.courseType === 'Individual' ? (
        <input
          type="text"
          name="name"
          placeholder="Enter Course Name"
          value={formData.name}
          onChange={handleChange}
        />
      ) : (
        <div className="combo-courses">
          {formData.comboCourses.map((course, index) => (
            <div key={index} className="combo-row">
              <input
                type="text"
                placeholder={`Combo Course #${index + 1}`}
                value={course}
                onChange={(e) => handleComboChange(index, e.target.value)}
              />
              {formData.comboCourses.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeComboCourse(index)}>-</button>
              )}
              {index === formData.comboCourses.length - 1 && formData.comboCourses.length < 10 && (
                <button type="button" className="add-btn" onClick={addComboCourse}>+</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="form-grid">
        <input
          type="number"
          placeholder="Course Duration (in hours)"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />
        <input
          type="number"
          placeholder="Course Fees (₹)"
          name="fees"
          value={formData.fees}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit}><FaSave /> Save</button>
        {initialData && <button className="delete-btn" onClick={onDelete}><FaTrash /> Delete</button>}
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default CourseForm;
