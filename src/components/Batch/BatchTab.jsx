import React, { useState } from 'react';
import BatchList from './BatchList';
import WaitingListTab from './WaitingListTab';

const BatchTab = () => {
  const [activeTab, setActiveTab] = useState('batches');

  const tabStyle = (tab) => ({
    padding: '0.5rem 1rem',
    borderBottom: activeTab === tab ? '2px solid black' : 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📦 Batch Management</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('batches')} style={tabStyle('batches')}>
          🗂️ Batch List
        </button>
        <button onClick={() => setActiveTab('waiting')} style={tabStyle('waiting')}>
          ⏳ Waiting List
        </button>
      </div>

      {activeTab === 'batches' && <BatchList />}
      {activeTab === 'waiting' && <WaitingListTab />}
    </div>
  );
};

export default BatchTab;
