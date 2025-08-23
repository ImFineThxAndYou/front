
'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileCard from '../components/explore/ProfileCard';
import InterestFilter from '../components/explore/InterestFilter';
import EmptyState from '../components/explore/EmptyState';
import { useExploreStore } from '../../lib/stores/explore';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Category } from '../../lib/types/explore';

export default function ExplorePage() {
  const { 
    profiles = [], 
    isLoading, 
    error,
    selectedCategories = [],
    searchMode = 'peers',
    loadPeers, 
    loadFilteredUsers,
    setSelectedCategories,
    setSearchMode,
    clearError
  } = useExploreStore();
  
  const [showSearch, setShowSearch] = useState(false);
  const { t } = useTranslation('explore');

  const onlineUsers = 1247;
  const totalUsers = 15632;

  useEffect(() => {
    // 페이지 로드 시 같은 관심사 유저 조회
    loadPeers();
  }, [loadPeers]);

  const handleSearch = () => {
    if (selectedCategories && selectedCategories.length > 0) {
      loadFilteredUsers({ interests: selectedCategories });
    } else {
      loadPeers();
    }
  };

  const handleCategoryChange = (categories: Category[]) => {
    setSelectedCategories(categories);
  };

  const handleSearchModeChange = (mode: 'peers' | 'filter') => {
    setSearchMode(mode);
    if (mode === 'peers') {
      loadPeers();
    }
  };

  // Filter valid profiles to prevent rendering errors
  const validProfiles = (profiles || []).filter(profile => profile && profile.membername);

  return (
    <MainLayout>
      <div 
        className="h-full overflow-y-auto theme-transition"
        style={{
          background: `linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 25%, 
            var(--bg-tertiary) 50%, 
            var(--bg-secondary) 75%, 
            var(--bg-primary) 100%)`
        }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div 
              className="rounded-3xl p-8 text-white relative overflow-hidden theme-transition"
              style={{
                background: 'var(--gradient-primary)'
              }}
            >
              {/* Animated Background Elements */}
              <div 
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-32 -translate-y-32 animate-pulse"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              ></div>
              <div 
                className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl transform -translate-x-24 translate-y-24 animate-pulse delay-1000"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              ></div>
              <div 
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full blur-2xl animate-bounce"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div 
                      className="w-16 h-16 rounded-3xl flex items-center justify-center mr-6 backdrop-blur-sm"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <i className="ri-global-line text-3xl text-white"></i>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
                      <p className="text-white/90 text-lg">{t('subtitle')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className={`ri-${showSearch ? 'close' : 'search'}-line text-xl text-white`}></i>
                  </button>
                </div>

                {/* Live Stats */}
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-sm">{t('stats.onlineUsers')} {onlineUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-white/80 text-sm">{t('stats.totalUsers')} {totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-white/80 text-sm">{t('stats.languages')} 15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section - Toggleable */}
          {showSearch && (
            <div className="mb-8 animate-in slide-in-from-top duration-300">
              <div 
                className="backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 theme-transition"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* 검색 모드 선택 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSearchModeChange('peers')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        searchMode === 'peers'
                          ? 'text-white shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={searchMode === 'peers' ? {
                        background: 'var(--gradient-secondary)',
                        boxShadow: 'var(--shadow-lg)'
                      } : {
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border-secondary)'
                      }}
                    >
                      AI 추천
                    </button>
                    <button
                      onClick={() => handleSearchModeChange('filter')}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        searchMode === 'filter'
                          ? 'text-white shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={searchMode === 'filter' ? {
                        background: 'var(--gradient-secondary)',
                        boxShadow: 'var(--shadow-lg)'
                      } : {
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border-secondary)'
                      }}
                    >
                      관심사 필터
                    </button>

                  </div>
                  
                  <div className="flex-1">
                    <InterestFilter
                      selectedCategories={selectedCategories}
                      onCategoryChange={handleCategoryChange}
                    />
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {searchMode === 'peers' ? 'AI 추천 받기' : '필터 검색'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center space-x-2">
                <i className="ri-error-warning-line text-red-500"></i>
                <span className="text-red-700">{error}</span>
                <button 
                  onClick={clearError}
                  className="ml-auto p-1 hover:bg-red-100 rounded"
                  title="오류 메시지 닫기"
                >
                  <i className="ri-close-line text-red-500"></i>
                </button>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--info)' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>{t('search.searching')}</p>
              </div>
            ) : validProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {validProfiles.map((profile, index) => (
                  <ProfileCard key={profile.membername} profile={profile} delay={index * 100} />
                ))}
              </div>
            ) : (
              <EmptyState 
                hasFilters={searchMode === 'filter' && selectedCategories && selectedCategories.length > 0}
                onClearFilters={() => {
                  setSelectedCategories([]);
                  loadPeers();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
