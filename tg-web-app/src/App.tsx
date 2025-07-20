import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import { UserProvider } from './contexts/UserContext';
import ProfileSetup from './pages/ProfileSetup';
import SwipeCards from './pages/SwipeCards';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Инициализация приложения
    const initApp = async () => {
      try {
        // Проверяем, есть ли профиль пользователя
        const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        
        if (telegramId) {
          const response = await fetch(`/api/users/profile/${telegramId}`);
          if (response.ok) {
            setHasProfile(true);
          }
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <TelegramProvider>
      <UserProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route 
                path="/" 
                element={
                  hasProfile ? <Navigate to="/swipe" replace /> : <Navigate to="/setup" replace />
                } 
              />
              <Route path="/setup" element={<ProfileSetup onComplete={() => setHasProfile(true)} />} />
              <Route path="/swipe" element={<SwipeCards />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat/:matchId" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            
            {hasProfile && (
              <Navigation />
            )}
          </div>
        </Router>
      </UserProvider>
    </TelegramProvider>
  );
}

export default App;