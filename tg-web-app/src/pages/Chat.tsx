import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MessageBubble from '../components/MessageBubble';
import './Chat.css';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName?: string;
    photos: string[];
  };
  content: string;
  type: 'text' | 'image' | 'gif';
  isRead: boolean;
  createdAt: string;
}

interface Match {
  _id: string;
  user1: any;
  user2: any;
  isMatched: boolean;
}

const Chat: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { webApp, user: telegramUser } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!matchId || !telegramUser?.id) return;
    
    try {
      const response = await fetch(`/api/messages/chat/${matchId}/${telegramUser.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 404) {
        navigate('/matches');
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !telegramUser?.id) return;
    
    setSending(true);
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': webApp?.initData || ''
        },
        body: JSON.stringify({
          senderTelegramId: telegramUser.id,
          matchId,
          content: newMessage.trim(),
          type: 'text'
        })
      });
      
      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        webApp?.HapticFeedback.impactOccurred('light');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      await fetchMessages();
      setLoading(false);
    };
    
    initChat();
    
    // Настройка кнопки назад
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate('/matches'));
      
      return () => {
        webApp.BackButton.hide();
      };
    }
  }, [matchId, telegramUser, webApp, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <p>Начните общение!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === telegramUser?.id?.toString()}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            rows={1}
            disabled={sending}
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;