import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => {
        const shuffled = res.data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        setCourses(selected);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
      });
  }, []);

  return (
    <div className="home-container">
      <div className="top-bar">
        <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
      </div>
      <h1>Available Courses</h1>
      <div className="course-grid">
        {courses.map((course, index) => (
          <div className="course-card fade-in" key={index}>
            <h3>{course.name}</h3>
            <p><strong>Duration:</strong> {course.duration}</p>
            <p><strong>Fees:</strong> ₹{course.fees}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
