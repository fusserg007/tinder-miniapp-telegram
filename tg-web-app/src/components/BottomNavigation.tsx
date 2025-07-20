import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-navigation">
      <Link 
        to="/swipe" 
        className={`nav-item ${isActive('/swipe') ? 'active' : ''}`}
      >
        <span className="nav-icon">💖</span>
        <span className="nav-label">Поиск</span>
      </Link>
      
      <Link 
        to="/matches" 
        className={`nav-item ${isActive('/matches') ? 'active' : ''}`}
      >
        <span className="nav-icon">🔥</span>
        <span className="nav-label">Матчи</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Профиль</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;