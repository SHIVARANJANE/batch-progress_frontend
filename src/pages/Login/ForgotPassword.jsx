import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
    const[step, setStep] = useState(1);
    const[email, setEmail] = useState('');
    const[otp, setOtp] = useState('');
    const[newPassword, setNewPassword] = useState('');

    const requestOtp = async () => {
        try{
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            alert('OTP sent to your email');
            setStep(2);
        }catch(err){
            alert(err.response.data.message || 'Error sending OTP');
        }
    };
    const resetPassword = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            alert('Password reset successful');
            setStep(1);
        } catch (err) {
            alert(err.response.data.message || 'Error resetting password');
        }
    };
    return(
        <div className='forgot-container'>
            { step === 1 ? (
                <>
                    <h2>Forgot Password</h2>
                    <input
                        type='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={requestOtp}>Request OTP</button>
                </>):(
                    <>
                    <h2>Reset Password</h2>
                    <input placeholder='Enter OTP'
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <input placeholder='Enter new password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button onClick={resetPassword}>Reset Password</button>
                    <button onClick={() => setStep(1)}>Back</button>
                    
                </>
                )}
        </div>
    );
}
export default ForgotPassword;