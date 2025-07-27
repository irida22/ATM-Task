import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBg from './ParticlesBg';
import { API_CONFIG } from '../config/api';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) {
      localStorage.clear();
      navigate('/');
      return;
    }
    loadTransactions();
  }, [userId, navigate]);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/transactions`);
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else if (response.status === 404) {
        setError('User not found');
        setTimeout(() => {
          localStorage.clear();
          navigate('/');
        }, 2000);
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const renderTransactionItem = (transaction) => {
    const isDeposit = transaction.type === 'Deposit';
    
    return (
      <div key={transaction.id} className={`transaction-item ${isDeposit ? 'deposit' : 'withdrawal'}`}>
        <div className="transaction-icon">
          <i className={`fas ${isDeposit ? 'fa-plus-circle' : 'fa-minus-circle'}`}></i>
        </div>
        <div className="transaction-details">
          <div className="transaction-type">{transaction.type}</div>
          <div className="transaction-date">{formatDate(transaction.timestamp)} at {formatTime(transaction.timestamp)}</div>
        </div>
        <div className="transaction-amounts">
          <div className={`transaction-amount ${isDeposit ? 'positive' : 'negative'}`}>
            {isDeposit ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ParticlesBg />
      <div className="transaction-card">
        <div className="transaction-header">
          <i className="fas fa-history"></i>
          <h2>Transaction History</h2>
        </div>

        <div className="transactions-container">
          {loading && (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              Loading transactions...
            </div>
          )}
          
          {!loading && error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && transactions.length === 0 && (
            <div className="no-transactions">
              <i className="fas fa-inbox"></i>
              <p>No transactions found</p>
            </div>
          )}
          
          {!loading && !error && transactions.length > 0 && (
            <div className="transactions-list">
              {transactions.map(renderTransactionItem)}
            </div>
          )}
        </div>

        <div className="actions">
          <button onClick={() => navigate('/home')} className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
          <button onClick={loadTransactions} className="refresh-btn">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>
    </>
  );
};

export default Transactions; 