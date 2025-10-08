import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserStore } from '../../store/useUserStore';
import { postReq } from '../../lib/axios';

interface UserDetails {
  email: string;
  role: 'admin' | 'applicant';
}

const LoginPage = () => {
  const userProfile = useUserStore((state) => state.userProfile)
  const setLoggedInUser = useUserStore((state) => state.setLoggedInUser)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && userProfile._id) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUserDetails(null);

    try {
      const data = await postReq('/auth/login',
        { email, password }
      );

      setSuccess(`Welcome, ${data.email}`);
      setUserDetails(data);
      setLoggedInUser(data)

      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Something went wrong';

      setError(errorMessage);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <button
          className="btn-close ms-auto"
          onClick={() => navigate('/')}
          aria-label="Close"
        ></button>

        <h3 className="text-center mb-3">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {userDetails && (
          <div className="mb-3">
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Role:</strong> {userDetails.role}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Login
          </button>
        </form>

        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-link p-0" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
          <button className="btn btn-link p-0" onClick={() => navigate('/request')}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
