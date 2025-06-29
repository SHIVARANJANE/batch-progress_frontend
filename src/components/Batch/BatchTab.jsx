import React, { useState } from 'react';
import BatchList from './BatchList';
import WaitingList from './WaitingListTab';

const BatchTab = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6">
      <div className="flex justify-center gap-6 mb-6">
        <button
          className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 shadow-md ${
            activeTab === 'list' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
          }`}
          onClick={() => setActiveTab('list')}
        >
          📚 Batch List
        </button>
        <button
          className={`px-6 py-2 rounded-full text-white font-semibold transition duration-200 shadow-md ${
            activeTab === 'waiting' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
          }`}
          onClick={() => setActiveTab('waiting')}
        >
          ⏳ Waiting List
        </button>
      </div>

      {activeTab === 'list' ? <BatchList /> : <WaitingList />}
    </div>
  );
};

export default BatchTab;
