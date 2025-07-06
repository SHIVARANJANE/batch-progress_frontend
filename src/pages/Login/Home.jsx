import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`)
      .then(res => {
        const shuffled = res.data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        setCourses(selected);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
      });
  }, []);

  // Helper function to get the display name for a course
  const getCourseDisplayName = (course) => {
    if (course.courseType === 'Combo' && course.comboCourses && course.comboCourses.length > 0) {
      // If it's a combo course, and comboCourses exist, generate a name
      // Prioritize course.name if it's explicitly set for a combo (e.g., if you added that input field)
      return course.name || `Combo: ${course.comboCourses.join(' + ')}`;
    }
    // Otherwise (for individual courses or combo courses with an explicit name), use course.name
    return course.name;
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
      </div>
      <h1>Available Courses</h1>
      <div className="course-grid">
        {courses.map((course, index) => (
          <div className="course-card fade-in" key={index}>
            {/* Use the helper function to get the display name */}
            <h3>{getCourseDisplayName(course)}</h3>
            <p><strong>Duration:</strong> {course.duration}</p>
            <p><strong>Fees:</strong> ₹{course.fees}</p>
            {/* You might want to display custom properties here too if they are relevant to the public view */}
            {course.customProperties && Object.keys(course.customProperties).length > 0 && (
              <div className="custom-props-display">
                {Object.entries(course.customProperties).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {value}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;