import React, { useState, useEffect } from 'react';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tabs from './components/Tabs';
import History from './components/History';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
import { getAnalytics } from './api';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('history');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchBannerData() {
      const a = await getAnalytics();
      if (a) {
        setStreak(a.current_streak);
      }
    }
    fetchBannerData();
  }, [refreshCounter]);

  const handleMoodLogged = () => {
    setRefreshCounter(c => c + 1);
  };

  return (
    <>
      <Banner streak={streak} />
      <Navbar />
      
      <Hero onMoodLogged={handleMoodLogged} />

      <main className="content-canvas">
        <div className="container">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div style={{ marginTop: '48px' }}>
            {activeTab === 'history' && <History refreshCounter={refreshCounter} />}
            {activeTab === 'analytics' && <Analytics refreshCounter={refreshCounter} />}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
