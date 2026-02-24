import React from 'react';
import AppRouter from './router';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppRouter />
    </div>
  );
};

export default App;
