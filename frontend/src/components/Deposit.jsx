import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBg from './ParticlesBg';
import { API_CONFIG } from '../config/api';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('Loading...');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) {
      localStorage.clear();
      navigate('/');
      return;
    }
    fetchCurrentBalance();
  }, [userId, navigate]);

  const fetchCurrentBalance = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/balance`);
      if (response.ok) {
        const data = await response.json();
        setCurrentBalance(data.balance.toFixed(2));
      } else {
        setCurrentBalance('Error');
      }
    } catch (error) {
      setCurrentBalance('Error');
    }
  };

  const showMessage = (text, isSuccess = false) => {
    setMessage(text);
    setMessageType(isSuccess ? 'success' : 'error');
    setTimeout(() => setMessage(''), 3000);
  };

  const processDeposit = async (depositAmount) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Amount: depositAmount })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage(`Successfully deposited $${depositAmount.toFixed(2)}`, true);
        await fetchCurrentBalance();
        setAmount('');
      } else {
        showMessage(data.message || 'Deposit failed');
      }
    } catch (error) {
      showMessage('Network error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    
    if (depositAmount <= 0) {
      showMessage('Please enter a valid amount');
      return;
    }
    
    if (depositAmount > 50000) {
      showMessage('Maximum deposit amount is $50,000');
      return;
    }
    
    await processDeposit(depositAmount);
  };

  const setQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const goBack = () => {
    navigate('/home');
  };

  return (
    <>
      <ParticlesBg />
      <div className="transaction-card">
        <div className="transaction-header">
          <i className="fas fa-piggy-bank"></i>
          <h2>Deposit Money</h2>
        </div>
        
        <div className="balance-info">
          <p>Current Balance: ${currentBalance}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount to Deposit:</label>
            <input 
              type="number" 
              id="amount" 
              step="0.01" 
              min="0.01" 
              max="50000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>
          
          <div className="quick-amounts">
            <button type="button" onClick={() => setQuickAmount(50)}>$50</button>
            <button type="button" onClick={() => setQuickAmount(100)}>$100</button>
            <button type="button" onClick={() => setQuickAmount(500)}>$500</button>
            <button type="button" onClick={() => setQuickAmount(1000)}>$1000</button>
          </div>

          <button type="submit">Deposit</button>
          <button type="button" onClick={goBack}>Back</button>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default Deposit; 