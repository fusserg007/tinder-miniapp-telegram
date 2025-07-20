import React, { useState, useRef } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import LoadingSpinner from './LoadingSpinner';
import './PhotoUpload.css';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onChange, 
  maxPhotos = 6 
}) => {
  const { webApp } = useTelegram();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      webApp?.showAlert(`Можно загрузить максимум ${maxPhotos} фото`);
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: {
            'X-Telegram-Init-Data': webApp?.initData || ''
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки');
        }
        
        const data = await response.json();
        return data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...photos, ...uploadedUrls]);
      
      webApp?.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      webApp?.showAlert('Ошибка загрузки фото');
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
    webApp?.HapticFeedback.impactOccurred('light');
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    onChange(newPhotos);
    webApp?.HapticFeedback.impactOccurred('light');
  };

  return (
    <div className="photo-upload">
      <div className="photos-grid">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item">
            <img src={photo} alt={`Фото ${index + 1}`} />
            
            <div className="photo-controls">
              {index > 0 && (
                <button 
                  className="move-btn left"
                  onClick={() => movePhoto(index, index - 1)}
                  title="Переместить влево"
                >
                  ←
                </button>
              )}
              
              {index < photos.length - 1 && (
                <button 
                  className="move-btn right"
                  onClick={() => movePhoto(index, index + 1)}
                  title="Переместить вправо"
                >
                  →
                </button>
              )}
              
              <button 
                className="remove-btn"
                onClick={() => removePhoto(index)}
                title="Удалить"
              >
                ×
              </button>
            </div>
            
            {index === 0 && (
              <div className="main-photo-badge">
                Основная
              </div>
            )}
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <div className="photo-upload-slot">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <>
                  <span className="upload-icon">+</span>
                  <span className="upload-text">Добавить фото</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="photo-upload-info">
        <p>Загружено {photos.length} из {maxPhotos} фото</p>
        <small>Первое фото будет основным</small>
      </div>
    </div>
  );
};

export default PhotoUpload;