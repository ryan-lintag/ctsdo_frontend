import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { postReq } from '../../lib/axios';

interface FormData {
  email: string;
  password: string;
  role: 'applicant' | 'admin';
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    role: 'applicant',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const data = await postReq('/auth/register', formData) as any;
      setMessage(data.message || 'Verification email sent.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '1000px', width: '100%' }}>
        <h3 className="text-center mb-4">Signup</h3>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  placeholder="First Name"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="middleName" className="form-label">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  className="form-control"
                  placeholder="Middle Name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder="Last Name"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                <input
                  aria-label="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  aria-label="form-select"
                  name="role"
                  className="form-select"
                  onChange={handleChange}
                >
                  <option value="applicant">Applicant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Submit
          </button>
        </form>

        <div className="d-flex justify-content-center mt-3">
          <p>Already have an account?</p>
          <button className="btn btn-link p-0" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
