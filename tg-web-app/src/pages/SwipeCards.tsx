import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useUser } from '../contexts/UserContext';
import SwipeCard from '../components/SwipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './SwipeCards.css';

interface Candidate {
  _id: string;
  firstName: string;
  lastName?: string;
  age: number;
  bio?: string;
  photos: string[];
}

const SwipeCards: React.FC = () => {
  const { webApp, user: telegramUser } = useTelegram();
  const { user } = useUser();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  const fetchCandidates = async () => {
    if (!telegramUser?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/users/candidates/${telegramUser.id}?limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Ошибка загрузки кандидатов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (swiping || currentIndex >= candidates.length) return;
    
    setSwiping(true);
    const currentCandidate = candidates[currentIndex];
    
    try {
      const response = await fetch('/api/matches/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': webApp?.initData || ''
        },
        body: JSON.stringify({
          userTelegramId: telegramUser?.id,
          targetUserId: currentCandidate._id,
          liked
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.matched) {
          webApp?.HapticFeedback.notificationOccurred('success');
          // Можно показать уведомление о матче
          alert('🎉 Поздравляем! У вас новый матч!');
        } else {
          webApp?.HapticFeedback.impactOccurred('light');
        }
        
        setCurrentIndex(prev => prev + 1);
        
        // Если осталось мало кандидатов, загружаем ещё
        if (currentIndex >= candidates.length - 3) {
          fetchCandidates();
        }
      }
    } catch (error) {
      console.error('Ошибка свайпа:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setSwiping(false);
    }
  };

  useEffect(() => {
    if (user && telegramUser) {
      fetchCandidates();
    }
  }, [user, telegramUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (candidates.length === 0 || currentIndex >= candidates.length) {
    return (
      <div className="swipe-cards">
        <div className="no-candidates">
          <div className="no-candidates-icon">🔍</div>
          <h2>Никого не найдено</h2>
          <p>Попробуйте расширить параметры поиска в настройках</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchCandidates}
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="swipe-cards">
      <div className="cards-container">
        <SwipeCard
          candidate={currentCandidate}
          onSwipe={handleSwipe}
          disabled={swiping}
        />
        
        {/* Показываем следующую карточку сзади */}
        {currentIndex + 1 < candidates.length && (
          <div className="next-card">
            <SwipeCard
              candidate={candidates[currentIndex + 1]}
              onSwipe={() => {}}
              disabled={true}
            />
          </div>
        )}
      </div>
      
      <div className="swipe-actions">
        <button 
          className="action-btn dislike-btn"
          onClick={() => handleSwipe(false)}
          disabled={swiping}
        >
          ❌
        </button>
        
        <button 
          className="action-btn like-btn"
          onClick={() => handleSwipe(true)}
          disabled={swiping}
        >
          ❤️
        </button>
      </div>
      
      <div className="cards-counter">
        {currentIndex + 1} / {candidates.length}
      </div>
    </div>
  );
};

export default SwipeCards;