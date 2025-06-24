import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './CourseTable.css';

function CourseTable({ courses, onEdit, onDelete, isAdminView }) {
  const grouped = courses.reduce((acc, course) => {
    const vertical = course.vertical || 'Unknown';
    acc[vertical] = acc[vertical] || [];
    acc[vertical].push(course);
    return acc;
  }, {});

  return (
    <div className="grouped-table">
      {Object.entries(grouped).map(([vertical, groupCourses]) => (
        <div key={vertical}>
          <h3>{vertical}</h3>
          <table className="course-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Course Name</th>
                <th>Duration</th>
                <th>Enrolled Students</th>
                {isAdminView && <th>Edit/Delete</th>}
              </tr>
            </thead>
            <tbody>
              {groupCourses.map((course, index) => (
                <tr key={course._id} style={{ '--i': index }}>
                  <td data-label="S.NO">{index + 1}</td>
                  <td data-label="Course Name">{course.name}</td>
                  <td data-label="Duration">{course.duration}</td>
                  <td data-label="Enrolled Students">{course.enrolled || 0}</td>
                  {isAdminView && (
                    <td data-label="Edit/Delete">
                      <FaEdit className="icon" onClick={() => onEdit(course)} />
                      <span>/</span>
                      <FaTrash className="icon" onClick={() => onDelete(course._id)} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default CourseTable;
