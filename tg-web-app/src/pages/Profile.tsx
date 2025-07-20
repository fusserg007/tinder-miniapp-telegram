import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTelegram } from '../contexts/TelegramContext';
import PhotoUpload from '../components/PhotoUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser, loading } = useUser();
  const { webApp } = useTelegram();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    age: user?.age || 18,
    bio: user?.bio || '',
    photos: user?.photos || [],
    preferences: user?.preferences || {
      minAge: 18,
      maxAge: 50,
      maxDistance: 50
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({
      ...prev,
      photos
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUser(formData);
      setEditing(false);
      webApp?.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      age: user?.age || 18,
      bio: user?.bio || '',
      photos: user?.photos || [],
      preferences: user?.preferences || {
        minAge: 18,
        maxAge: 50,
        maxDistance: 50
      }
    });
    setEditing(false);
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Мой профиль</h1>
        {!editing && (
          <button 
            className="btn btn-secondary"
            onClick={() => setEditing(true)}
          >
            Редактировать
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-photos">
          <h3>Фото</h3>
          {editing ? (
            <PhotoUpload
              photos={formData.photos}
              onChange={handlePhotosChange}
              maxPhotos={6}
            />
          ) : (
            <div className="photos-grid">
              {user.photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`Фото ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-section">
            <h3>Основная информация</h3>
            
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={`${user.firstName} ${user.lastName || ''}`}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Возраст</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                disabled={!editing}
              />
            </div>

            <div className="form-group">
              <label>О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Напишите немного о себе..."
                maxLength={500}
                rows={4}
                disabled={!editing}
              />
              {editing && <small>{formData.bio.length}/500</small>}
            </div>
          </div>

          <div className="info-section">
            <h3>Предпочтения</h3>
            
            <div className="form-group">
              <label>Возраст: {formData.preferences.minAge} - {formData.preferences.maxAge}</label>
              {editing && (
                <div className="range-inputs">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.preferences.minAge}
                    onChange={(e) => handlePreferenceChange('minAge', parseInt(e.target.value))}
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.preferences.maxAge}
                    onChange={(e) => handlePreferenceChange('maxAge', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Максимальное расстояние: {formData.preferences.maxDistance} км</label>
              {editing && (
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.preferences.maxDistance}
                  onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="profile-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={saving}
          >
            Отмена
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;