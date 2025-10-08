import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { DashboardComponent } from '../../components/DashboardComponent';
import { putReq } from '../../lib/axios';
import { useUserStore } from '../../store/useUserStore';
import type { UserProfile } from '../../types/common.types';

const MyProfile: React.FC = () => {
  const userProfile = useUserStore((state) => state.userProfile)
  const setLoggedInUser = useUserStore((state) => state.setLoggedInUser)
  const [formData, setFormData] = useState<UserProfile>(userProfile);

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

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
      const data = await putReq(`/api/user/${userProfile._id}`, formData);
      console.log('data:', data)
      setMessage('Your profile is successfully updated.');
      setLoggedInUser(formData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Update profile failed';
      setError(errorMsg);
    }
  };

  return (
    <DashboardComponent>
      <div className='dashboard-title'>My Profile</div>
      <div className="container d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow p-4" style={{ maxWidth: '1000px', width: '100%' }}>
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
                    value={formData.firstName}
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
                    value={formData.middleName}
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
                    value={formData.lastName}
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
                    value={formData.dateOfBirth.toString().substring(0, 10)}
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
                    value={formData.email}
                    className="form-control"
                    placeholder="Email"
                    required
                    disabled
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
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Update
            </button>
          </form>
        </div>
      </div>
    </DashboardComponent>
  );
};

export default MyProfile;
