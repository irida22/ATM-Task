import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBg from './ParticlesBg';
import { API_CONFIG } from '../config/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: pin
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userId', data.userId);
        navigate('/home');
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ParticlesBg />
      <div className="login-card">
        <div className="login-header">
          <i className="fas fa-lock"></i>
          <h2>ATM Login</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            <span>{loading ? 'Loading...' : 'Login'}</span>
          </button>
          {error && (
            <div className="error">
              <i className="fas fa-exclamation-circle"></i> Invalid credentials
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default Login; 