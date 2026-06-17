import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Tabs from '../components/Tabs';
import History from '../components/History';
import Analytics from '../components/Analytics';
import Footer from '../components/Footer';
import Calendar from './Calendar';
import { getAnalytics } from '../api';
import { useAuth } from '../auth/AuthProvider';

export default function Dashboard() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchBannerData() {
      const a = await getAnalytics(accessToken);
      if (a) setStreak(a.current_streak);
    }
    if (accessToken) fetchBannerData();
  }, [refreshCounter, accessToken]);

  const handleMoodLogged = () => setRefreshCounter((c) => c + 1);

  return (
    <>
      <Banner streak={streak} />
      <Navbar />
      <Hero onMoodLogged={handleMoodLogged} accessToken={accessToken} />

      <main className="content-canvas">
        <div className="container">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div style={{ marginTop: '48px' }}>
            {activeTab === 'history' && <History refreshCounter={refreshCounter} accessToken={accessToken} />}
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'analytics' && <Analytics refreshCounter={refreshCounter} accessToken={accessToken} />}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
