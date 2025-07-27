import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBg from './ParticlesBg';
import { API_CONFIG } from '../config/api';

const Home = () => {
  const [balance, setBalance] = useState('Loading...');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) {
      localStorage.clear();
      navigate('/');
      return;
    }
    fetchBalance();
  }, [userId, navigate]);

  const fetchBalance = async () => {
    setBalance('Loading...');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BALANCE}/${userId}/balance`);
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance.toFixed(2));
      } else if (response.status === 404) {
        setBalance('User not found');
        setTimeout(() => logout(), 2000);
      } else {
        setBalance('Error loading balance');
      }
    } catch (error) {
      setBalance('Network error');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      <ParticlesBg />
      <div className="home-card">
        <div className="home-header">
          <i className="fas fa-user-circle"></i>
          <h2>Your Account</h2>
        </div>
        
        <div className="balance-section">
          <h3>Current Balance</h3>
          <div className="balance-amount">${balance}</div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/withdraw')}>Withdraw</button>
          <button onClick={() => navigate('/deposit')}>Deposit</button>
          <button onClick={() => navigate('/transactions')}>History</button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
    </>
  );
};

export default Home; 