import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Matches.css';

interface Match {
  matchId: string;
  user: {
    _id: string;
    firstName: string;
    lastName?: string;
    photos: string[];
    age: number;
  };
  matchedAt: string;
}

const Matches: React.FC = () => {
  const { user: telegramUser } = useTelegram();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!telegramUser?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/list/${telegramUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки матчей:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [telegramUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (matches.length === 0) {
    return (
      <div className="matches">
        <div className="matches-header">
          <h1>Матчи</h1>
        </div>
        
        <div className="no-matches">
          <div className="no-matches-icon">💔</div>
          <h2>Пока нет матчей</h2>
          <p>Продолжайте свайпать, чтобы найти свою любовь!</p>
          <Link to="/swipe" className="btn btn-primary">
            Начать поиск
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="matches">
      <div className="matches-header">
        <h1>Матчи ({matches.length})</h1>
      </div>
      
      <div className="matches-grid">
        {matches.map((match) => (
          <Link 
            key={match.matchId} 
            to={`/chat/${match.matchId}`}
            className="match-card"
          >
            <div className="match-photo">
              <img 
                src={match.user.photos[0]} 
                alt={match.user.firstName}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-avatar.png';
                }}
              />
            </div>
            
            <div className="match-info">
              <h3>
                {match.user.firstName} {match.user.lastName}
              </h3>
              <p>{match.user.age} лет</p>
              <small>
                Матч {new Date(match.matchedAt).toLocaleDateString('ru-RU')}
              </small>
            </div>
            
            <div className="match-arrow">
              ›
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Matches;