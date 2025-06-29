import React, { useState } from 'react';
import BatchList from './BatchList';
import WaitingListTab from './WaitingListTab';

const BatchTab = () => {
  const [activeTab, setActiveTab] = useState('batches');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
console.log('Token:', token);
console.log('Token:', token);

  const tabStyle = (tab) => ({
    padding: '0.5rem 1rem',
    borderBottom: activeTab === tab ? '2px solid black' : 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  if (!token) return <p>⛔ Unauthorized: Please login to access batch management.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📦 Batch Management</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('batches')} style={tabStyle('batches')}>
          🗂️ Batch List
        </button>
        {(role === 'admin' || role === 'superadmin') && (
          <button onClick={() => setActiveTab('waiting')} style={tabStyle('waiting')}>
            ⏳ Waiting List
          </button>
        )}
      </div>

      {activeTab === 'batches' && <BatchList />}
      {activeTab === 'waiting' && (role === 'admin' || role === 'superadmin') && <WaitingListTab />}
    </div>
  );
};

export default BatchTab;
