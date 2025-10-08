import React, { useState, FormEvent } from 'react';

const RequestReset: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as { message?: string };

      if (!response.ok) {
        setError(data.message || 'An unexpected error occurred');
        return;
      }


      setMessage(data.message || 'Password reset link sent successfully');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="request-reset-container">
        <h2>Request Password Reset</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Request Reset Link'}
          </button>
        </form>

        {/* Display the success or error message */}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div >
  );
};

export default RequestReset;

