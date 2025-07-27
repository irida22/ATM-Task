import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBg from './ParticlesBg';
import { API_CONFIG } from '../config/api';

const Withdraw = () => {
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
        return data.balance;
      } else {
        setCurrentBalance('Error');
        return 0;
      }
    } catch (error) {
      setCurrentBalance('Error');
      return 0;
    }
  };

  const showMessage = (text, isSuccess = false) => {
    setMessage(text);
    setMessageType(isSuccess ? 'success' : 'error');
    setTimeout(() => setMessage(''), 3000);
  };

  const processWithdraw = async (withdrawAmount) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Amount: withdrawAmount })
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage(`Successfully withdrew $${withdrawAmount.toFixed(2)}`, true);
        await fetchCurrentBalance();
        setAmount('');
      } else {
        showMessage(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      showMessage('Network error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount <= 0) {
      showMessage('Please enter a valid amount');
      return;
    }
    
    const balance = parseFloat(currentBalance) || 0;
    if (withdrawAmount > balance) {
      showMessage('Insufficient funds');
      return;
    }
    
    await processWithdraw(withdrawAmount);
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
          <i className="fas fa-credit-card"></i>
          <h2>Withdraw Money</h2>
        </div>
        
        <div className="balance-info">
          <p>Available Balance: ${currentBalance}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount to Withdraw:</label>
            <input 
              type="number" 
              id="amount" 
              step="0.01" 
              min="0.01" 
              max="10000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required 
            />
          </div>
          
          <div className="quick-amounts">
            <button type="button" onClick={() => setQuickAmount(20)}>$20</button>
            <button type="button" onClick={() => setQuickAmount(50)}>$50</button>
            <button type="button" onClick={() => setQuickAmount(100)}>$100</button>
            <button type="button" onClick={() => setQuickAmount(200)}>$200</button>
          </div>

          <button type="submit">Withdraw</button>
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

export default Withdraw; 