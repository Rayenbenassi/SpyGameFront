import React, { useState, useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { playBackgroundMusic } from './src/utils/BackgroundMusic';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    playBackgroundMusic(); // Start background music when the app launches
  }, []);

  return showSplash ? (
    <SplashScreen onFinish={() => setShowSplash(false)} />
  ) : (
    <AppNavigator />
  );
};

export default App;
