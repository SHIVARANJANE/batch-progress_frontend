import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState(''); // ⬅️ Added
  const [messageType, setMessageType] = useState(''); // 'error' | 'success'
  const navigate = useNavigate();

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000); // Auto-hide after 4s
  };

  const handleEmailSubmit = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/user-role?email=${email}`);
      const userRole = res.data.role;
      const userEmail = res.data.email;
      setRole(userRole);

      if (userRole === 'student') {
        const otpRes = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { email });
        showMessage(otpRes.data.message, 'success');
        setStep('otp');
        setOtpSent(true);
      } else {
        setStep('password');
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Email not found", 'error');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      showMessage(res.data.message, 'success');
      setStep('otp');
      setOtpSent(true);
    } catch (error) {
      showMessage(error.response?.data?.message || "Login failed", 'error');
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-otp`, {
        email,
        otp
      });
      const { token, role,userId ,staffId} = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      localStorage.setItem('staffId', staffId); // 🆕 Add this
      showMessage(res.data.message, 'success');

      setTimeout(() => {
        if (role === 'super_user') navigate('/SuperAdminDashboard');
        else if (role === 'admin') navigate('/AdminDashboard');
        else if (role === 'staff') navigate('/StaffDashboard');
        else navigate('/StudentDashboard');
      }, 1000);
    } catch (error) {
      showMessage(error.response?.data?.message || "OTP verification failed", 'error');
    }
  };

  return (
    <div className="login-background">
      <div className="login-card">
        <h2>Login</h2>

        {/* 🔔 Message Box */}
        {message && (
          <div className={`message-box ${messageType}`}>
            {message}
          </div>
        )}

        {step === 'email' && (
  <>
    <div className="input-with-icon">
      <span>📧</span>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <button onClick={handleEmailSubmit}>Next</button>
  </>
)}

{step === 'password' && (
  <>
    <div className="input-with-icon">
      <span>🔒</span>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    <p>
      <a onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>
        Forgot Password?
      </a>
    </p>
    <button onClick={handleLogin}>Login</button>
  </>
)}

{step === 'otp' && otpSent && (
  <>
    <h3>Enter OTP</h3>
    <div className="input-with-icon">
      <span>🔢</span>
      <input
        type="text"
        placeholder="OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
    </div>
    <button onClick={handleVerify}>Verify OTP</button>
  </>
)}

      </div>
    </div>
  );
}

export default Login;
