import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './app/layout';
import DashboardPage from './app/page';
import GeneratePage from './app/generate/page';
import SettingsPage from './app/settings/page';
import './app/globals.css'; 

const App: React.FC = () => {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </RootLayout>
    </Router>
  );
};

export default App;