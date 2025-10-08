import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/auth/verify-email/${token}`);
        // If response is an object like { message: "..." }
        setMessage(response.data?.message || 'Verification successful');
        setStatus('success');
      } catch (err: any) {
        // If error response is an object like { message: "..." }
        setMessage(err.response?.data?.message || 'Verification failed');
        setStatus('error');
      }
    };

    if (token) {
      verify();
    } else {
      setMessage('Invalid token');
      setStatus('error');
    }
  }, [token]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Email Verification</h2>

      {status === 'verifying' && <p>Verifying your email...</p>}

      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}

      {status === 'success' && (
        <>
          <p style={{ color: 'green' }}>{message}</p>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
