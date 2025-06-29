import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';

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
        alert("Please select a course name");
        return;
      }
      onSave(formData);
    } else {
      const validCourses = formData.comboCourses.filter(c => c);
      if (validCourses.length < 2) {
        alert("Please select at least two courses for a combo.");
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
    Architecture:['Vray','Lumion'],
    Electrical: ['IOT', 'Lighting Design'],
    'CS/IT':['Python','Java','C','C++'],
    'Project Management':['PMP','Power BI'],
  };

  return (
    <div className="course-form">
      <h3>{initialData ? "Edit Course" : "Add New Course"}</h3>

      {/* Vertical */}
      <select name="vertical" value={formData.vertical} onChange={handleChange}>
        <option value="">Course Vertical</option>
        <option value="Cadd">Cadd</option>
        <option value="Livewire">Livewire</option>
        <option value="Synergy">Synergy</option>
      </select>

      {/* Domain */}
      <select
        name="domain"
        value={formData.domain}
        onChange={handleChange}
        disabled={!formData.vertical}
      >
        <option value="">Domain</option>
        {domainOptions[formData.vertical]?.map((domain, index) => (
          <option key={index} value={domain}>{domain}</option>
        ))}
      </select>

      {/* Category */}
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        disabled={!formData.domain}
      >
        <option value="">Course Category</option>
        {categoryOptions[formData.domain]?.map((cat, index) => (
          <option key={index} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Course Type */}
      <select
        name="courseType"
        value={formData.courseType}
        onChange={(e) =>
          setFormData({
            ...formData,
            courseType: e.target.value,
            name: '',
            comboCourses: [''],
          })
        }
      >
        <option value="Individual">Individual Course</option>
        <option value="Combo">Combo Course</option>
      </select>

      {/* Course Name */}
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
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <input
                type="text"
                placeholder={`Combo Course #${index + 1}`}
                value={course}
                onChange={(e) => handleComboChange(index, e.target.value)}
              />
              {formData.comboCourses.length > 1 && (
                <button type="button" onClick={() => removeComboCourse(index)}>-</button>
              )}
              {index === formData.comboCourses.length - 1 && formData.comboCourses.length < 10 && (
                <button type="button" onClick={addComboCourse}>+</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Duration and Fees */}
      <input
        type="number"
        placeholder="Course Duration (Hrs)"
        name="duration"
        value={formData.duration}
        onChange={handleChange}
      />
      <input
        type="number"
        placeholder="Course Fees"
        name="fees"
        value={formData.fees}
        onChange={handleChange}
      />

      {/* Buttons */}
      <div className="form-buttons">
        <FaSave className="icon" onClick={handleSubmit} />
        {initialData && <FaTrash className="icon" onClick={onDelete} />}
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default CourseForm;
