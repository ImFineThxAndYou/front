
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/hooks/useTranslation';
import MainLayout from '../components/layout/MainLayout';
import { useWordbookStore, Word } from '../../lib/stores/wordbook';
import WordRow from '../components/wordbook/WordRow';
import WordModal from '../components/wordbook/WordModal';
import FilterPanel from '../components/wordbook/FilterPanel';
import BulkActions from '../components/wordbook/BulkActions';
import EmptyWordbook from '../components/wordbook/EmptyWordbook';
import QuizPanel from '../components/wordbook/QuizPanel';

export default function WordbookPage() {
  const { t } = useTranslation('wordbook');
  const {
    words,
    filters,
    selectedWords,
    isLoading,
    getFilteredWords,
    getTodayWords,
    setSearchQuery,
    selectWord,
    clearSelection
  } = useWordbookStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Get filtered and today's words
  const filteredWords = getFilteredWords();
  const todayWords = getTodayWords();

  return (
    <MainLayout>
      <div 
        className="h-full flex flex-col theme-transition"
        style={{
          background: `linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 25%, 
            var(--bg-tertiary) 50%, 
            var(--bg-secondary) 75%, 
            var(--bg-primary) 100%)`
        }}
      >
        {/* Compact Header */}
        <div className="flex-shrink-0 p-6">
          <div 
            className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 theme-transition"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--info), var(--success))'
                  }}
                >
                  <i className="ri-sparkles-line text-xl text-white"></i>
                </div>
                <div>
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('title')}
                  </h1>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {filteredWords.length}{t('common.words')} • {t('common.today')} {todayWords.length}{t('common.words')} {t('common.added')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Quick Test Buttons */}
                <div 
                  className="flex items-center rounded-xl p-1 border theme-transition"
                  style={{
                    background: 'linear-gradient(135deg, var(--success), var(--info))',
                    borderColor: 'var(--border-secondary)'
                  }}
                >
                  <button
                    onClick={() => setShowQuizPanel(true)}
                    className="flex items-center px-3 py-2 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer font-medium text-sm shadow-lg"
                    style={{
                      backgroundColor: 'var(--success)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <i className="ri-flashlight-line w-4 h-4 mr-1"></i>
                    {t('quiz.title')}
                  </button>
                  <button 
                    className="flex items-center px-3 py-2 rounded-lg hover:shadow-lg transition-all cursor-pointer font-medium text-sm ml-1"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--success)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <i className="ri-target-line w-4 h-4 mr-1"></i>
                    {t('quiz.review')}
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div 
                  className="flex items-center rounded-lg p-1 theme-transition"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all cursor-pointer ${
                      viewMode === 'list' 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'list' ? 'var(--info)' : 'transparent'
                    }}
                  >
                    <i className="ri-list-check w-4 h-4"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'grid' ? 'var(--info)' : 'transparent'
                    }}
                  >
                    <i className="ri-grid-line w-4 h-4"></i>
                  </button>
                </div>

                {/* Add Word Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--success), var(--info))',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <i className="ri-add-line w-4 h-4 mr-2"></i>
                  {t('addWord')}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div 
                className="text-center p-3 rounded-xl border theme-transition"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >{filteredWords.length}</div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >{t('filters.all')}</div>
              </div>
              <div 
                className="text-center p-3 rounded-xl border theme-transition"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >{todayWords.length}</div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >{t('common.today')}</div>
              </div>
              <div 
                className="text-center p-3 rounded-xl border theme-transition"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >{filteredWords.filter(w => w.difficulty <= 2).length}</div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >{t('stats.mastered')}</div>
              </div>
              <div 
                className="text-center p-3 rounded-xl border theme-transition"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >{filteredWords.filter(w => w.difficulty >= 4).length}</div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >{t('stats.reviewNeeded')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="w-80 border-r flex-shrink-0 theme-transition">
              <FilterPanel />
            </div>
          )}

          {/* Words List */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div 
              className="flex items-center justify-between p-4 border-b theme-transition"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-secondary)'
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-quaternary)' }}></i>
                  <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={filters.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                      e.target.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    showFilterPanel 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  style={{
                    backgroundColor: showFilterPanel ? 'var(--info)' : 'var(--surface-tertiary)'
                  }}
                >
                  <i className="ri-filter-line w-4 h-4"></i>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {selectedWords.length > 0 && (
                  <BulkActions />
                )}
                <button
                  onClick={() => setShowQuizPanel(true)}
                  className="flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer whitespace-nowrap hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--warning)',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <i className="ri-play-circle-line w-4 h-4 mr-2"></i>
                  {t('quiz.startQuiz')}
                </button>
              </div>
            </div>

            {/* Words Grid/List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredWords.length === 0 ? (
                <EmptyWordbook hasSearch={!!filters.searchQuery} onAddWord={() => setShowAddModal(true)} />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredWords.map((word) => (
                    <div 
                      key={word.id}
                      className="p-4 rounded-2xl border hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 theme-transition"
                      style={{
                        backgroundColor: 'var(--surface-primary)',
                        borderColor: 'var(--border-secondary)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="font-semibold text-lg"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {word.word}
                        </span>
                        <div className="flex items-center space-x-2">
                          <i className="ri-time-line w-4 h-4" style={{ color: 'var(--text-quaternary)' }}></i>
                        </div>
                      </div>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {word.meanings.join(', ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: word.difficulty <= 2 ? 'var(--success)' : 
                                           word.difficulty <= 3 ? 'var(--warning)' : 'var(--error)',
                            color: 'white'
                          }}
                        >
                          {word.difficulty <= 2 ? t('common.difficulty.beginner') :
                           word.difficulty <= 3 ? t('common.difficulty.intermediate') : t('common.difficulty.advanced')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWord(word);
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          style={{ color: 'var(--text-quaternary)' }}
                        >
                          <i className="ri-more-2-line w-4 h-4"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredWords.map((word) => (
                    <WordRow
                      key={word.id}
                      word={word}
                      isSelected={selectedWords.includes(word.id)}
                      onSelect={() => selectWord(word.id)}
                      onEdit={() => setEditingWord(word)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddModal && (
          <WordModal
            word={null}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {editingWord && (
          <WordModal
            word={editingWord}
            onClose={() => setEditingWord(null)}
          />
        )}

        {showQuizPanel && (
          <QuizPanel
            words={filteredWords}
            todayWords={todayWords}
            onClose={() => setShowQuizPanel(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}
