
'use client';

import { useState, useEffect } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useAuthStore } from '../../../lib/stores/auth';

const INTERESTS = [
  'travel', 'music', 'sports', 'movies', 'books', 'cooking', 
  'gaming', 'art', 'technology', 'photography', 'fitness', 'nature'
];

const COUNTRIES = [
  'South Korea', 'United States', 'Japan', 'United Kingdom', 
  'Germany', 'France', 'Canada', 'Australia', 'China', 'Other'
];

export default function ProfileSection() {
  const { t } = useTranslation(['me', 'common']);
  const { user, updateProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    interests: [] as string[],
    languages: [] as string[],
    birthDate: '',
    country: '',
    region: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        interests: user.interests || [],
        languages: user.languages || [],
        birthDate: user.birthDate || '',
        country: user.country || '',
        region: user.region || ''
      });
      setAvatarPreview(user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...formData,
        avatarUrl: avatarPreview
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        interests: user.interests || [],
        languages: user.languages || [],
        birthDate: user.birthDate || '',
        country: user.country || '',
        region: user.region || ''
      });
      setAvatarPreview(user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : '');
    }
    setIsEditing(false);
  };

  const toggleInterest = (interest: string) => {
    if (!isEditing) return;
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarClick = () => {
    if (!isEditing) return;
    // Mock file upload
    const newAvatar = `https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20photo%20clean%20white%20background%20modern%20style%20person&width=400&height=400&seq=avatar${Date.now()}&orientation=squarish`;
    setAvatarPreview(newAvatar);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
                  <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
                      {t('profile.title')}
        </h2>
        <p
          className="mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
                      {t('profile.subtitle')}
        </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded-lg whitespace-nowrap"
                style={{
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <i className="ri-close-line w-4 h-4 mr-2 inline text-base"></i>
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }
                }}
              >
                <i className="ri-save-line w-4 h-4 mr-2 inline text-base"></i>
                                  {isSaving ? t('profile.saving') : t('profile.save')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg whitespace-nowrap"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-on-accent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              }}
            >
              {t('profile.edit')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Preview */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-xl border p-6 sticky top-6"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('profile.preview')}
            </h3>
            
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden mx-auto"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <i className="ri-camera-line w-8 h-8 text-2xl"></i>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-on-accent)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    }}
                  >
                    <i className="ri-camera-line w-4 h-4 text-base"></i>
                  </button>
                )}
              </div>
              
              <h4 
                className="font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formData.nickname || t('profile.noNickname')}
              </h4>
              
              <p 
                className="text-sm mt-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {formData.bio || t('profile.noBio')}
              </p>
              
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {formData.interests.slice(0, 3).map(interest => (
                    <span 
                      key={interest} 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-on-accent)'
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                  {formData.interests.length > 3 && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      +{formData.interests.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div 
            className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('profile.nickname')}
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: isEditing ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                                          placeholder={t('profile.nicknamePlaceholder')}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('profile.birthDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: isEditing ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('profile.bio')}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none"
                  style={{
                    borderColor: 'var(--border-primary)',
                    backgroundColor: isEditing ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                                      placeholder={t('profile.bioPlaceholder')}
                />
                <div 
                  className="text-right text-xs mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {formData.bio.length}/500
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('profile.country')}
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-8"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: isEditing ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                                          <option value="">{t('profile.selectCountry')}</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('profile.region')}
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: isEditing ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                                          placeholder={t('profile.regionPlaceholder')}
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label 
                  className="block text-sm font-medium mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('profile.interests')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      disabled={!isEditing}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        !isEditing ? 'cursor-default' : 'cursor-pointer'
                      }`}
                      style={{
                        backgroundColor: formData.interests.includes(interest)
                          ? 'var(--accent-primary)'
                          : 'var(--surface-secondary)',
                        color: formData.interests.includes(interest)
                          ? 'var(--text-on-accent)'
                          : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.backgroundColor = formData.interests.includes(interest)
                            ? 'var(--accent-primary-hover)'
                            : 'var(--surface-tertiary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isEditing) {
                          e.currentTarget.style.backgroundColor = formData.interests.includes(interest)
                            ? 'var(--accent-primary)'
                            : 'var(--surface-secondary)';
                        }
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
