import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// ❌ REMOVE: import { loginUser } from '../../services/auth'; // Not needed anymore
import { useAuth } from '../../context/AuthContext';
import './styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    // Destructure the login function from the context
    const { login } = useAuth(); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // ✅ UPDATED: Call the context's login function directly with formData
            const loginResult = await login(formData);

            if (!loginResult.success) {
                // If login failed, throw an error to be caught below
                throw new Error(loginResult.error || 'Login failed.');
            }

            const user = loginResult.user;

            alert(`Welcome back, ${user.role === 'client' ? user.anonymousName : user.fullName}!`);

            // Redirect based on role
            if (user.role === 'client') {
                window.location.href = '/client-dashboard';
            } else if (user.role === 'counsellor') {
                window.location.href = '/counsellor-dashboard';
            } else if (user.role === 'admin') {
                window.location.href = '/admin-dashboard';
            } else {
                window.location.href = '/client-dashboard'; // Fallback
            }

        } catch (error) {
            console.error('Login error:', error);

            // Use the error message returned from the context
            const message = error.response?.data?.message || error.message;

            if (message.includes('verify')) {
                alert('Please verify your email before logging in. Check your email for the verification link.');
            } else {
                alert(message || 'Login failed. Please check your credentials and try again.');
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your mental wellness journey</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'input-error' : ''}
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/" className="auth-link">
                            Create one here
                        </Link>
                    </p>
                    <p>
                        <a href="#forgot-password" className="auth-link">
                            Forgot your password?
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;