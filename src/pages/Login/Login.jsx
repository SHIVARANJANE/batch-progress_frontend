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
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/user-role?email=${email}`);
      const userRole = res.data.role;
      const userEmail=res.data.email;
      setRole(userRole);
      console.log(userRole);
      console.log(userEmail);
      if (userRole == 'student') {
        // directly send OTP
        console.log(res);
        const otpRes = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { email });
        alert(otpRes.data.message);
        setStep('otp');
        setOtpSent(true);
      } else {
        setStep('password');
      }
    } catch (error) {
      alert(error.response?.data?.message || "Email not found");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      alert(res.data.message);
      setStep('otp');
      setOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-otp`, {
        email,
        otp
      });
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);
      alert(res.data.message);
      if (role === 'super_user') navigate('/SuperAdminDashboard');
      else if (role === 'admin') navigate('/AdminDashboard');
      else if (role === 'staff') navigate('/StaffDashboard');
      else navigate('/StudentDashboard');
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="login-background">
      <div className="login-card">
        <h2>Login</h2>

        {step === 'email' && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button onClick={handleEmailSubmit}>Next</button>
          </>
        )}

        {step === 'password' && (
          <>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p>
              <a onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer', color: 'blue' }}>
                Forgot Password?
              </a>
            </p>
            <button onClick={handleLogin}>Login</button>
          </>
        )}

        {step === 'otp' && otpSent && (
          <>
            <h3>Enter OTP</h3>
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button onClick={handleVerify}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
