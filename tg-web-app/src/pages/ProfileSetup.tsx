import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTelegram } from '../contexts/TelegramContext';
import PhotoUpload from '../components/PhotoUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfileSetup.css';

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { updateUser } = useUser();
  const { webApp } = useTelegram();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    bio: '',
    photos: [] as string[],
    preferences: {
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

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      webApp?.HapticFeedback.selectionChanged();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      webApp?.HapticFeedback.selectionChanged();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      await updateUser({
        age: parseInt(formData.age),
        bio: formData.bio,
        photos: formData.photos,
        preferences: formData.preferences
      });
      
      webApp?.HapticFeedback.notificationOccurred('success');
      onComplete();
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      webApp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age && parseInt(formData.age) >= 18 && parseInt(formData.age) <= 100;
      case 2:
        return formData.photos.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-setup">
      <div className="setup-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <h1>Настройка профиля</h1>
        <p>Шаг {step} из 3</p>
      </div>

      <div className="setup-content">
        {step === 1 && (
          <div className="step">
            <h2>Расскажите о себе</h2>
            
            <div className="form-group">
              <label>Возраст</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Введите ваш возраст"
              />
            </div>

            <div className="form-group">
              <label>О себе (необязательно)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Напишите немного о себе..."
                maxLength={500}
                rows={4}
              />
              <small>{formData.bio.length}/500</small>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Добавьте фото</h2>
            <p>Добавьте минимум 1 фото, максимум 6</p>
            
            <PhotoUpload
              photos={formData.photos}
              onChange={handlePhotosChange}
              maxPhotos={6}
            />
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Предпочтения</h2>
            
            <div className="form-group">
              <label>Возраст: {formData.preferences.minAge} - {formData.preferences.maxAge}</label>
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
            </div>

            <div className="form-group">
              <label>Максимальное расстояние: {formData.preferences.maxDistance} км</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.preferences.maxDistance}
                onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="setup-actions">
        {step > 1 && (
          <button 
            className="btn btn-secondary" 
            onClick={handleBack}
          >
            Назад
          </button>
        )}
        
        {step < 3 ? (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            Далее
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!isStepValid()}
          >
            Завершить
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;