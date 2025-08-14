'use client';

import { useTranslation } from '../../../lib/hooks/useTranslation';
import { Category } from '../../../lib/types/explore';

const interests: { value: Category; label: string }[] = [
  { value: Category.LANGUAGE_LEARNING, label: '언어학습' },
  { value: Category.TRAVEL, label: '여행' },
  { value: Category.CULTURE, label: '문화' },
  { value: Category.BUSINESS, label: '비즈니스' },
  { value: Category.EDUCATION, label: '교육' },
  { value: Category.TECHNOLOGY, label: '기술' },
  { value: Category.SPORTS, label: '스포츠' },
  { value: Category.MUSIC, label: '음악' },
  { value: Category.FOOD, label: '음식' },
  { value: Category.ART, label: '예술' },
  { value: Category.SCIENCE, label: '과학' },
  { value: Category.HISTORY, label: '역사' },
  { value: Category.MOVIES, label: '영화' },
  { value: Category.GAMES, label: '게임' },
  { value: Category.LITERATURE, label: '문학' },
  { value: Category.PHOTOGRAPHY, label: '사진' },
  { value: Category.NATURE, label: '자연' },
  { value: Category.FITNESS, label: '피트니스' },
  { value: Category.FASHION, label: '패션' },
  { value: Category.VOLUNTEERING, label: '봉사활동' },
  { value: Category.ANIMALS, label: '동물' },
  { value: Category.CARS, label: '자동차' },
  { value: Category.DIY, label: 'DIY' },
  { value: Category.FINANCE, label: '금융' }
];

interface InterestFilterProps {
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
}

export default function InterestFilter({ selectedCategories, onCategoryChange }: InterestFilterProps) {
  const { t } = useTranslation('explore');

  const toggleCategory = (category: Category) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div 
      className="backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div className="flex items-center mb-4">
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center mr-3"
          style={{
            background: 'var(--gradient-secondary)'
          }}
        >
          <i className="ri-hashtag text-white text-sm"></i>
        </div>
        <label 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('filters.interests') || 'Interests'}
        </label>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {interests.map(({ value, label }) => {
          const isSelected = selectedCategories.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleCategory(value)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 hover:-translate-y-0.5 border ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'hover:shadow-lg'
              }`}
              style={isSelected ? {
                background: 'var(--gradient-secondary)',
                boxShadow: 'var(--shadow-lg)'
              } : {
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-secondary)'
              }}
              role="checkbox"
              aria-checked={isSelected}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}