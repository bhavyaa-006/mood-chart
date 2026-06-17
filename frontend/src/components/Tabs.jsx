import React from 'react';

export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="suite-tabs">
      <button
        className={`suite-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        Journal History
      </button>

      <button
        className={`suite-tab ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveTab('calendar')}
      >
        Calendar
      </button>

      <button
        className={`suite-tab ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => setActiveTab('analytics')}
      >
        Analytics & AI Insights
      </button>
    </div>
  );
}
