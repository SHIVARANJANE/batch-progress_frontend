import React, { useState } from 'react';
import BatchList from './BatchList';
import WaitingList from './WaitingListTab';
import './BatchTab.css'; // ⬅️ Import custom styles

const BatchTab = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="batch-tab-container">
      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📚 Batch List
        </button>
        <button
          className={`tab-btn ${activeTab === 'waiting' ? 'active' : ''}`}
          onClick={() => setActiveTab('waiting')}
        >
          ⏳ Waiting List
        </button>
        <div className={`tab-indicator ${activeTab === 'waiting' ? 'right' : 'left'}`} />
      </div>

      <div className="tab-content">
        {activeTab === 'list' ? <BatchList /> : <WaitingList />}
      </div>
    </div>
  );
};

export default BatchTab;
