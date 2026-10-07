import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState(null);

  const handleLoadDemo = (key) => {
    setActiveDemo(key);
    navigate('/investigate');
  };

  const handleNewInvestigation = () => {
    setActiveDemo(null);
    navigate('/investigate');
    // window.location.reload() or reset
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar onLoadDemo={handleLoadDemo} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Routes>
          {/* Landing Page (Full Width Hero) */}
          <Route 
            path="/" 
            element={
              <main className="flex-1 w-full">
                <LandingPage onLoadDemo={handleLoadDemo} />
              </main>
            } 
          />

          {/* Workbench / Dashboard Page with Sidebar */}
          <Route 
            path="/investigate" 
            element={
              <div className="flex-1 flex w-full">
                <Sidebar 
                  onNewInvestigation={handleNewInvestigation} 
                  onLoadDemo={handleLoadDemo} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  <DashboardPage initialDemoKey={activeDemo} />
                </main>
              </div>
            } 
          />

          {/* History Page with Sidebar */}
          <Route 
            path="/history" 
            element={
              <div className="flex-1 flex w-full">
                <Sidebar 
                  onNewInvestigation={handleNewInvestigation} 
                  onLoadDemo={handleLoadDemo} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  <HistoryPage />
                </main>
              </div>
            } 
          />

          {/* Settings & Diagnostics with Sidebar */}
          <Route 
            path="/settings" 
            element={
              <div className="flex-1 flex w-full">
                <Sidebar 
                  onNewInvestigation={handleNewInvestigation} 
                  onLoadDemo={handleLoadDemo} 
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  <SettingsPage />
                </main>
              </div>
            } 
          />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800 bg-surface-950/90 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FIELDSENSE AI • Multimodal Evidence Intelligence Engine</span>
          <span>"See it. Hear it. Understand it. Cross-check it."</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
