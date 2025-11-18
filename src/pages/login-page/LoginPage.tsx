import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserStore } from '../../store/useUserStore';
import { postReq } from '../../lib/axios';
import logo from '../../assets/images/logo.jpg';

const LoginPage = () => {
  const userProfile = useUserStore((state) => state.userProfile);
  const setLoggedInUser = useUserStore((state) => state.setLoggedInUser);

  const [identifier, setIdentifier] = useState<string>(''); // <-- unified email/username
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && userProfile._id) {
      navigate('/dashboard');
      return;
    }
  }, [navigate, userProfile]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // ✅ backend now expects { identifier, password }
      const data = await postReq('/auth/login', { identifier, password }) as any;

      setSuccess(`Welcome back, ${data.username || data.email}!`);
      setLoggedInUser(data);
      navigate('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Invalid username/email or password.';
      if (err?.response?.status === 401) {
        errorMessage = 'Something went wrong. Please try again later.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

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

        {/* Header with Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px',
          }}
        >
          <img
            src={logo}
            alt="Login Icon"
            style={{ width: '40px', height: '40px' }}
          />
          <h3 className="mb-0">Login</h3>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>⚠️ Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>✅ Success:</strong> {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* ✅ Single identifier input (for email or username) */}
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">
              Email or Username
            </label>
            <input
              type="text"
              className="form-control"
              id="identifier"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
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

          {/* Submit */}
          <button type="submit" className="btn btn-primary w-100 mt-3">
            Login
          </button>
        </form>

        {/* Links */}
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
