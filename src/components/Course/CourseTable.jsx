import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './CourseTable.css'; // We'll heavily modify this CSS file

function CourseTable({ courses, onEdit, onDelete, isAdminView }) {
  // Separate individual and combo courses
  const individualCourses = courses.filter(course => course.courseType === 'Individual');
  const comboCourses = courses.filter(course => course.courseType === 'Combo');

  // Group individual courses by vertical
  const groupedIndividual = individualCourses.reduce((acc, course) => {
    const vertical = course.vertical || 'Unknown';
    acc[vertical] = acc[vertical] || [];
    acc[vertical].push(course);
    return acc;
  }, {});

  // Group combo courses by vertical and then by category
  const groupedCombo = comboCourses.reduce((acc, course) => {
    const vertical = course.vertical || 'Unknown';
    const category = course.category || 'Unknown';
    acc[vertical] = acc[vertical] || {};
    acc[vertical][category] = acc[vertical][category] || [];
    acc[vertical][category].push(course);
    return acc;
  }, {});

  return (
    <div className="course-dashboard">
      <h2>Individual Courses</h2>
      {Object.entries(groupedIndividual).length > 0 ? (
        Object.entries(groupedIndividual).map(([vertical, groupCourses]) => (
          <div key={vertical} className="course-vertical-section">
            <h3 className="vertical-title">{vertical}</h3>
            <div className="course-cards-container">
              {groupCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="card-header">
                    <h4 className="course-name">{course.name}</h4>
                    {isAdminView && (
                      <div className="card-actions">
                        <FaEdit className="icon" onClick={() => onEdit(course)} />
                        <FaTrash className="icon" onClick={() => onDelete(course._id)} />
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p><strong>Enrolled:</strong> {course.enrolled || 0}</p>
                    <p><strong>Category:</strong> {course.category}</p>
                    <p><strong>Domain:</strong> {course.domain}</p>
                    <p><strong>Fees:</strong> ₹{course.fees}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="no-courses-message">No individual courses to display.</p>
      )}

      <h2>Combo Courses</h2>
      {Object.entries(groupedCombo).length > 0 ? (
        Object.entries(groupedCombo).map(([vertical, categories]) => (
          <div key={vertical} className="course-vertical-section">
            <h3 className="vertical-title">{vertical}</h3>
            {Object.entries(categories).map(([category, comboGroupCourses]) => (
              <div key={category} className="combo-category-section">
                <h4 className="category-title">Category: {category}</h4>
                <div className="course-cards-container">
                  {comboGroupCourses.map((course) => (
                    <div key={course._id} className="course-card combo-card">
                      <div className="card-header">
                        <h4 className="course-name">
                          {course.name || `Combo: ${course.comboCourses.join(' + ')}`}
                        </h4>
                        {isAdminView && (
                          <div className="card-actions">
                            <FaEdit className="icon" onClick={() => onEdit(course)} />
                            <FaTrash className="icon" onClick={() => onDelete(course._id)} />
                          </div>
                        )}
                      </div>
                      <div className="card-details">
                        <p><strong>Duration:</strong> {course.duration}</p>
                        <p><strong>Enrolled:</strong> {course.enrolled || 0}</p>
                        <p><strong>Fees:</strong> ₹{course.fees}</p>
                        <div className="combo-courses-list">
                          <strong>Includes:</strong>
                          {course.comboCourses && course.comboCourses.length > 0 ? (
                            <ul>
                              {course.comboCourses.map((comboName, idx) => (
                                <li key={idx}>{comboName}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="no-courses-message">No combo courses to display.</p>
      )}
    </div>
  );
}

export default CourseTable;