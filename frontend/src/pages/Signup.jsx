import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!username.trim() || username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(username, password);
      const { token, user } = res.data;
      
      // Store user details in local storage
      localStorage.setItem('sangeet_token', token);
      localStorage.setItem('sangeet_user', JSON.stringify(user));
      
      toast.success(res.data.message || 'Registration successful! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to sign up. Username might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page page-enter d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - var(--nav-h))' }}>
      <div className="container">
        <div className="admin-card" style={{ maxWidth: '440px' }}>
          <div className="admin-card-head">
            <h2>SANGEET</h2>
            <p>Tune of Trends – Register</p>
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleSignup} noValidate>
              
              {/* Username */}
              <div className="f-group">
                <label className="f-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="f-input"
                  type="text"
                  placeholder="At least 3 characters"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  disabled={loading}
                />
                {errors.username && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.username}</p>}
              </div>

              {/* Password */}
              <div className="f-group">
                <label className="f-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="f-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  disabled={loading}
                />
                {errors.password && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="f-group" style={{ marginBottom: '2rem' }}>
                <label className="f-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  className="f-input"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.confirmPassword}</p>}
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> Creating Account...</>
                ) : (
                  <>Register & Explore <i className="bi bi-arrow-right-circle ms-1" /></>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                  Log in here
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
