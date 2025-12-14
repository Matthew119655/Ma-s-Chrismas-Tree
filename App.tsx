import React, { Suspense } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { HandTracker } from './components/HandTracker';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative selection:bg-none">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white">Loading Christmas Magic...</div>}>
        <Scene />
      </Suspense>
      
      <UI />
      <HandTracker />
      
      {/* Font Loader hack for the cursive title */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}</style>
    </div>
  );
};

export default App;
