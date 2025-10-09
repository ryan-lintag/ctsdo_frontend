import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postReq } from '../../lib/axios';


const ResetPassword: React.FC = () => {
  const { token } = useParams(); // No need for generic typing
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Missing or invalid token.');
      return;
    }

    try {
      const res = await postReq(`/auth/reset-password/${token}`,
        { newPassword }
      ) as any;
      setMessage(res.message || 'Password reset successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Reset failed.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          required
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;

