import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './router';
import './i18n'; // Initialize i18n

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        <AppRouter />
      </div>
    </HelmetProvider>
  );
};

export default App;
