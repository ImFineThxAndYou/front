'use client';

import { useState, useEffect } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useWordbookStore } from '../../../lib/stores/wordbook';
import type { Word } from '../../lib/stores/wordbook';

interface WordModalProps {
  word?: Word | null;
  onClose: () => void;
}

const PARTS_OF_SPEECH = [
  'noun', 'verb', 'adjective', 'adverb', 
  'preposition', 'conjunction', 'interjection'
];

export default function WordModal({ word, onClose }: WordModalProps) {
  const { t } = useTranslation(['wordbook', 'common']);
  const { addWord, updateWord } = useWordbookStore();
  
  const [formData, setFormData] = useState({
    word: '',
    partOfSpeech: 'noun',
    difficulty: 3,
    meanings: [''],
    examples: [''],
    tags: ['']
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word,
        partOfSpeech: word.partOfSpeech,
        difficulty: word.difficulty,
        meanings: word.meanings.length > 0 ? word.meanings : [''],
        examples: word.examples.length > 0 ? word.examples : [''],
        tags: word.tags.length > 0 ? word.tags : ['']
      });
    }
  }, [word]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.word.trim()) {
      newErrors.word = t('wordbook.errors.wordRequired');
    }
    
    const validMeanings = formData.meanings.filter(m => m.trim());
    if (validMeanings.length === 0) {
      newErrors.meanings = t('wordbook.errors.meaningRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const wordData = {
        word: formData.word.trim(),
        partOfSpeech: formData.partOfSpeech,
        difficulty: formData.difficulty,
        meanings: formData.meanings.filter(m => m.trim()),
        examples: formData.examples.filter(e => e.trim()),
        tags: formData.tags.filter(t => t.trim())
      };

      if (word) {
        await updateWord(word.id, wordData);
      } else {
        await addWord(wordData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayField = (field: 'meanings' | 'examples' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'meanings' | 'examples' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: 'meanings' | 'examples' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'var(--accent-success)',
      2: 'var(--accent-primary)', 
      3: 'var(--accent-warning)',
      4: 'var(--accent-orange)',
      5: 'var(--accent-danger)'
    };
    return colors[difficulty as keyof typeof colors] || 'var(--accent-tertiary)';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'var(--overlay)' }}>
      <div 
        className="backdrop-blur-xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl"
        style={{
          backgroundColor: 'var(--surface-primary-alpha)',
          borderColor: 'var(--border-primary-alpha)'
        }}
      >
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, var(--accent-primary-alpha), var(--accent-secondary-alpha), var(--accent-tertiary-alpha))'
            }}
          ></div>
          <div 
            className="relative flex items-center justify-between p-8 border-b"
            style={{ borderColor: 'var(--border-primary-alpha)' }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              >
                <i className="ri-book-open-line w-6 h-6 text-white text-2xl" />
              </div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {word ? t('wordbook.editWord') : t('wordbook.addWord')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl transition-all duration-200 cursor-pointer"
              style={{
                color: 'var(--text-tertiary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <i className="ri-close-line w-6 h-6 text-xl" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Word Input */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <i className="ri-book-open-line w-5 h-5 text-lg" style={{ color: 'var(--accent-primary)' }} />
              <span>{t('wordbook.form.word')} *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.word}
                onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                className="w-full px-6 py-4 text-lg border-2 rounded-2xl focus:ring-0 focus:outline-none transition-all duration-300"
                style={{
                  borderColor: errors.word ? 'var(--accent-danger)' : 'var(--border-secondary)',
                  backgroundColor: errors.word ? 'var(--accent-danger-bg)' : 'var(--surface-primary)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  if (!errors.word) {
                    e.target.style.borderColor = 'var(--accent-primary)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.word) {
                    e.target.style.borderColor = 'var(--border-secondary)';
                  }
                }}
                placeholder={t('wordbook.form.wordPlaceholder')}
              />
              {errors.word && (
                <p className="mt-2 text-sm flex items-center space-x-2" style={{ color: 'var(--accent-danger)' }}>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent-danger)' }}
                  ></div>
                  <span>{errors.word}</span>
                </p>
              )}
            </div>
          </div>

          {/* Part of Speech & Difficulty Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Part of Speech */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <i className="ri-hash w-5 h-5" style={{ color: 'var(--accent-secondary)' }} />
                <span>{t('wordbook.form.partOfSpeech')}</span>
              </label>
              <select
                value={formData.partOfSpeech}
                onChange={(e) => setFormData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                className="w-full px-6 py-4 text-lg border-2 rounded-2xl focus:ring-0 focus:outline-none transition-all duration-300 cursor-pointer pr-8"
                style={{
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-secondary)';
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                }}
                onMouseLeave={(e) => {
                  if (e.target !== document.activeElement) {
                    e.target.style.borderColor = 'var(--border-secondary)';
                  }
                }}
              >
                {PARTS_OF_SPEECH.map(pos => (
                  <option key={pos} value={pos}>
                    {t(`wordbook.partOfSpeech.${pos}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <i className="ri-star-fill w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
                <span>{t('wordbook.form.difficulty')} ({formData.difficulty}/5)</span>
              </label>
              <div className="space-y-4">
                <div 
                  className="relative h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${(formData.difficulty / 5) * 100}%`,
                      backgroundColor: getDifficultyColor(formData.difficulty)
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer slider opacity-0 absolute"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                />
                <div className="flex justify-between text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{t('wordbook.difficulty.easy')}</span>
                  <span>{t('wordbook.difficulty.hard')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meanings */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <i className="ri-book-open-line w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span>{t('wordbook.form.meanings')} *</span>
            </label>
            {formData.meanings.map((meaning, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => updateArrayField('meanings', index, e.target.value)}
                    className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-0 focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      backgroundColor: 'var(--surface-primary)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (e.target !== document.activeElement) {
                        e.target.style.borderColor = 'var(--border-secondary)';
                      }
                    }}
                    placeholder={t('wordbook.form.meaningPlaceholder')}
                  />
                </div>
                {formData.meanings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('meanings', index)}
                    className="p-3 rounded-2xl transition-all duration-200"
                    style={{
                      color: 'var(--text-tertiary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-danger)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-danger-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-delete-bin-line w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('meanings')}
              className="flex items-center font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
            >
              <i className="ri-add-line w-5 h-5 mr-2" />
              {t('wordbook.form.addMeaning')}
            </button>
            {errors.meanings && (
              <p className="text-sm flex items-center space-x-2" style={{ color: 'var(--accent-danger)' }}>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent-danger)' }}
                ></div>
                <span>{errors.meanings}</span>
              </p>
            )}
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <i className="ri-book-open-line w-5 h-5" style={{ color: 'var(--accent-success)' }} />
              <span>{t('wordbook.form.examples')}</span>
            </label>
            {formData.examples.map((example, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={example}
                    onChange={(e) => updateArrayField('examples', index, e.target.value)}
                    className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-0 focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      backgroundColor: 'var(--surface-primary)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-success)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (e.target !== document.activeElement) {
                        e.target.style.borderColor = 'var(--border-secondary)';
                      }
                    }}
                    placeholder={t('wordbook.form.examplePlaceholder')}
                  />
                </div>
                {formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('examples', index)}
                    className="p-3 rounded-2xl transition-all duration-200"
                    style={{
                      color: 'var(--text-tertiary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-danger)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-danger-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-delete-bin-line w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('examples')}
              className="flex items-center font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-success)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-success-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-success)';
              }}
            >
              <i className="ri-add-line w-5 h-5 mr-2" />
              {t('wordbook.form.addExample')}
            </button>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <i className="ri-hash w-5 h-5" style={{ color: 'var(--accent-tertiary)' }} />
              <span>{t('wordbook.form.tags')}</span>
            </label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateArrayField('tags', index, e.target.value)}
                    className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-0 focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      backgroundColor: 'var(--surface-primary)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-tertiary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (e.target !== document.activeElement) {
                        e.target.style.borderColor = 'var(--border-secondary)';
                      }
                    }}
                    placeholder={t('wordbook.form.tagPlaceholder')}
                  />
                </div>
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('tags', index)}
                    className="p-3 rounded-2xl transition-all duration-200"
                    style={{
                      color: 'var(--text-tertiary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-danger)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-danger-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-delete-bin-line w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('tags')}
              className="flex items-center font-medium transition-colors duration-200"
              style={{ color: 'var(--accent-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-tertiary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-tertiary)';
              }}
            >
              <i className="ri-add-line w-5 h-5 mr-2" />
              {t('wordbook.form.addTag')}
            </button>
          </div>

          {/* Enhanced Actions */}
          <div 
            className="flex justify-end space-x-4 pt-8 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border-2 rounded-2xl whitespace-nowrap font-semibold transition-all duration-200 cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 rounded-2xl hover:shadow-2xl disabled:opacity-50 whitespace-nowrap font-semibold transition-all duration-300 hover:-translate-y-0.5 border cursor-pointer"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--text-on-accent)',
                borderColor: 'var(--accent-primary-alpha)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}