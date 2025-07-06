import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify
import './ForgotPassword.css';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const requestOtp = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`, { email });
            toast.success('OTP sent to your email'); // Use toast.success for success messages
            setStep(2);
        } catch (err) {
            toast.error(err.response.data.message || 'Error sending OTP'); // Use toast.error for error messages
        }
    };

    const resetPassword = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`, { email, otp, newPassword });
            toast.success('Password reset successful. Please login'); // Use toast.success
            setStep(1);
            setEmail(''); // Clear email field after successful reset
            setOtp(''); // Clear OTP field
            setNewPassword(''); // Clear new password field
        } catch (err) {
            toast.error(err.response.data.message || 'Error resetting password'); // Use toast.error
        }
    };

    return (
        <div className='forgot-container'>
            {step === 1 ? (
                <>
                    <h2>Forgot Password</h2>
                    <input
                        type='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={requestOtp}>Request OTP</button>
                </>
            ) : (
                <>
                    <h2>Reset Password</h2>
                    <input
                        type='text'
                        placeholder='Enter OTP'
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Enter new password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button onClick={resetPassword}>Reset Password</button>
                    <button onClick={() => setStep(1)}>Back</button>
                </>
            )}
            <ToastContainer /> {/* Add ToastContainer to render toasts */}
        </div>
    );
}

export default ForgotPassword;