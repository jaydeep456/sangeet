import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('prefill') === 'admin') {
      setUsername('Sangeet');
      setPassword('Sangeet@123');
    }
  }, [location]);

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password);
      const { token, user } = res.data;
      
      // Store user details in local storage
      localStorage.setItem('sangeet_token', token);
      localStorage.setItem('sangeet_user', JSON.stringify(user));
      
      toast.success(res.data.message || 'Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid username or password');
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
            <p>Tune of Trends – Login</p>
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleLogin} noValidate>
              
              {/* Username */}
              <div className="f-group">
                <label className="f-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="f-input"
                  type="text"
                  placeholder="Enter your username"
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
              <div className="f-group" style={{ marginBottom: '2rem' }}>
                <label className="f-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="f-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  disabled={loading}
                />
                {errors.password && <p className="f-error"><i className="bi bi-exclamation-circle" /> {errors.password}</p>}
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> Authenticating...</>
                ) : (
                  <>Access Collection <i className="bi bi-arrow-right-circle ms-1" /></>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                New to Sangeet?{' '}
                <Link to="/signup" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                  Create an account
                </Link>
              </p>
            </div>
            
            <div className="text-center mt-3 p-2" style={{ border: '1px dashed rgba(201,168,76,0.3)', borderRadius: '8px', background: 'var(--ivory)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                💡 <strong>Admin Demo Login:</strong><br />
                Username: <code>Sangeet</code><br />
                Password: <code>Sangeet@123</code>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
