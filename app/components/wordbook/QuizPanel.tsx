'use client';

import { useState } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import type { Word } from '../../lib/stores/wordbook';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface QuizPanelProps {
  words: Word[];
  todayWords: Word[];
  onClose: () => void;
}

type QuizType = 'meaning' | 'word' | 'mixed';
type QuizMode = 'setup' | 'quiz' | 'results';

interface QuizSettings {
  type: QuizType;
  difficulty: number[];
  count: number;
  timeLimit: boolean;
  timePerQuestion: number;
}

interface QuizQuestion {
  word: Word;
  type: 'meaning-to-word' | 'word-to-meaning';
  question: string;
  correctAnswer: string;
  options: string[];
}

interface QuizResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export default function QuizPanel({ words, todayWords, onClose }: QuizPanelProps) {
  const { t } = useTranslation('wordbook');
  const [mode, setMode] = useState<QuizMode>('setup');
  const [settings, setSettings] = useState<QuizSettings>({
    type: 'mixed',
    difficulty: [],
    count: 10,
    timeLimit: false,
    timePerQuestion: 30
  });

  const [quiz, setQuiz] = useState<{
    questions: QuizQuestion[];
    currentIndex: number;
    results: QuizResult[];
    startTime: number;
    questionStartTime: number;
  }>({
    questions: [],
    currentIndex: 0,
    results: [],
    startTime: 0,
    questionStartTime: 0
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const generateQuestions = (sourceWords: Word[]): QuizQuestion[] => {
    const filteredWords = sourceWords.filter(word => 
      settings.difficulty.length === 0 || settings.difficulty.includes(word.difficulty)
    );
    
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(settings.count, shuffled.length));
    
    return selectedWords.map(word => {
      const questionType = settings.type === 'mixed' 
        ? Math.random() > 0.5 ? 'meaning-to-word' : 'word-to-meaning'
        : settings.type === 'meaning' ? 'meaning-to-word' : 'word-to-meaning';

      const correctAnswer = questionType === 'meaning-to-word' ? word.word : word.meanings[0];
      const question = questionType === 'meaning-to-word' 
        ? `${t('quiz.meaningDesc')} "${word.meanings[0]}"`
        : `"${word.word}"${t('quiz.wordDesc')}`;

      // Generate wrong options
      const allWords = sourceWords.filter(w => w.id !== word.id);
      const wrongOptions: string[] = [];
      
      for (let i = 0; i < 3 && wrongOptions.length < 3; i++) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        const wrongAnswer = questionType === 'meaning-to-word' 
          ? randomWord.word 
          : randomWord.meanings[0];
        
        if (!wrongOptions.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
          wrongOptions.push(wrongAnswer);
        }
      }

      const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        word,
        type: questionType,
        question,
        correctAnswer,
        options
      };
    });
  };

  const startQuiz = (sourceWords: Word[] = words) => {
    const questions = generateQuestions(sourceWords);
    setQuiz({
      questions,
      currentIndex: 0,
      results: [],
      startTime: Date.now(),
      questionStartTime: Date.now()
    });
    setSelectedAnswer('');
    setMode('quiz');
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = quiz.questions[quiz.currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - quiz.questionStartTime;

    const newResult: QuizResult = {
      question: currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent
    };

    const newResults = [...quiz.results, newResult];

    if (quiz.currentIndex < quiz.questions.length - 1) {
      setQuiz(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        results: newResults,
        questionStartTime: Date.now()
      }));
      setSelectedAnswer('');
    } else {
      setQuiz(prev => ({
        ...prev,
        results: newResults
      }));
      setMode('results');
    }
  };

  const resetQuiz = () => {
    setMode('setup');
    setSelectedAnswer('');
    setQuiz({
      questions: [],
      currentIndex: 0,
      results: [],
      startTime: 0,
      questionStartTime: 0
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderSetupMode = () => (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <i className="ri-trophy-line w-10 h-10 text-white text-4xl" />
        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('quiz.settings')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('quiz.settingsDesc')}</p>
      </div>

      {/* Quick Start Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => startQuiz()}
          className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <i className="ri-trophy-line w-6 h-6 text-white text-xl" />
            </div>
                              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('quiz.allWordsTest')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('quiz.allWordsDesc')}</p>
            <div className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {words.length}{t('words')}
            </div>
          </div>
        </button>

        <button
          onClick={() => todayWords.length > 0 && startQuiz(todayWords)}
          disabled={todayWords.length === 0}
          className={`group p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer ${
            todayWords.length > 0
              ? 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform ${
              todayWords.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gray-400 text-gray-200'
            }`}>
                              <i className="ri-time-line w-6 h-6 text-xl" />
            </div>
            <h3 className={`font-bold mb-1 ${todayWords.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                {t('quiz.todayWords')}
            </h3>
            <p className={`text-sm mb-2 ${todayWords.length > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>
                              {todayWords.length > 0 ? t('quiz.todayWordsDesc') : t('quiz.todayWordsDesc')}
            </p>
            <div className={`text-xs px-2 py-1 rounded-full ${
              todayWords.length > 0 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            }`}>
              {todayWords.length}{t('words')}
            </div>
          </div>
        </button>

        <button className="group p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <i className="ri-target-line w-6 h-6 text-white text-xl" />
            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('quiz.reviewNeeded')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('quiz.reviewNeededDesc')}</p>
            <div className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                              23{t('words')}
            </div>
          </div>
        </button>
      </div>

      {/* Custom Settings */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <i className="ri-settings-3-line w-5 h-5 mr-2 text-blue-500 text-lg" />
          {t('quiz.customSettings')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('quiz.quizType')}
            </label>
            <div className="space-y-2">
              {[
                { value: 'mixed', label: t('quiz.mixed'), desc: t('quiz.mixedDesc') },
                { value: 'meaning', label: t('quiz.meaning'), desc: t('quiz.meaningDesc') },
                { value: 'word', label: t('quiz.word'), desc: t('quiz.wordDesc') }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSettings(prev => ({ ...prev, type: option.value as QuizType }))}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    settings.type === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('quiz.questionCount')}: {settings.count}{t('words')}
            </label>
            <input
              type="range"
              min="5"
              max={Math.min(words.length, 50)}
              value={settings.count}
              onChange={(e) => setSettings(prev => ({ ...prev, count: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5{t('common.words')}</span>
              <span>{Math.min(words.length, 50)}{t('common.words')}</span>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('quiz.difficultyFilter')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => {
                    const newDifficulty = settings.difficulty.includes(level)
                      ? settings.difficulty.filter(d => d !== level)
                      : [...settings.difficulty, level];
                    setSettings(prev => ({ ...prev, difficulty: newDifficulty }));
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    settings.difficulty.includes(level)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <i className="ri-star-fill w-3 h-3 mr-1 text-sm" />
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {settings.difficulty.length === 0 ? t('quiz.difficultyFilter') : `${t('quiz.difficultyFilter')}: ${settings.difficulty.join(', ')}`}
            </p>
          </div>

          {/* Time Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('quiz.timeLimit')}
            </label>
            <div className="space-y-3">
              <button
                onClick={() => setSettings(prev => ({ ...prev, timeLimit: !prev.timeLimit }))}
                className={`flex items-center px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  settings.timeLimit
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300'
                }`}
              >
                <i className="ri-time-line w-4 h-4 mr-2 text-base" />
                {settings.timeLimit ? t('quiz.timeLimitEnabled') : t('quiz.timeLimitDisabled')}
              </button>
              
              {settings.timeLimit && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('quiz.timePerQuestion')} {settings.timePerQuestion}{t('quiz.averageTime')}
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={settings.timePerQuestion}
                    onChange={(e) => setSettings(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => startQuiz()}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 font-bold text-lg hover:-translate-y-1 cursor-pointer"
      >
                        <i className="ri-play-line w-5 h-5 inline mr-2 text-lg" />
                            {t('quiz.startQuiz')}
      </button>
    </div>
  );

  const renderQuizMode = () => {
    const currentQuestion = quiz.questions[quiz.currentIndex];
    const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="p-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {t('quiz.currentQuestion')} {quiz.currentIndex + 1} / {quiz.questions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {settings.timeLimit && `${settings.timePerQuestion}${t('quiz.timeRemaining')}`}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">{quiz.currentIndex + 1}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentQuestion.question}
          </h2>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
                              <i className="ri-star-fill w-4 h-4 mr-1 text-base" />
                              {t('quiz.difficulty')} {currentQuestion.word.difficulty}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {currentQuestion.word.partOfSpeech}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all cursor-pointer ${
                selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold ${
                  selectedAnswer === option
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  backgroundColor: selectedAnswer === option ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                  color: selectedAnswer === option ? 'var(--text-on-accent)' : 'var(--text-secondary)'
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAnswer}
          disabled={!selectedAnswer}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
        >
                          {quiz.currentIndex < quiz.questions.length - 1 ? t('quiz.nextQuestion') : t('quiz.viewResults')}
        </button>
      </div>
    );
  };

  const renderResultsMode = () => {
    const correctCount = quiz.results.filter(r => r.isCorrect).length;
    const totalCount = quiz.results.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    const totalTime = quiz.results.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = Math.round(totalTime / totalCount / 1000);

    return (
      <div className="p-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
            percentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
            percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
            'bg-gradient-to-r from-amber-500 to-orange-600'
          }`}>
                            <i className="ri-trophy-line w-12 h-12 text-white text-5xl" />
          </div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('quiz.quizComplete')}</h2>
          <div className={`text-4xl font-bold mb-4 ${getScoreColor(percentage)}`}>
            {correctCount}/{totalCount} ({percentage}%)
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <i className="ri-checkbox-circle-line w-8 h-8 text-emerald-600 mx-auto mb-2 text-4xl" />
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{correctCount}</div>
                              <div className="text-sm text-emerald-600 dark:text-emerald-400">{t('quiz.correct')}</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <i className="ri-close-circle-line w-8 h-8 text-red-600 mx-auto mb-2 text-4xl" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{totalCount - correctCount}</div>
                              <div className="text-sm text-red-600 dark:text-red-400">{t('quiz.incorrect')}</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <i className="ri-time-line w-8 h-8 text-blue-600 mx-auto mb-2 text-4xl" />
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{avgTime}{t('quiz.averageTime')}</div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">{t('quiz.averageTime')}</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
          {quiz.results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                result.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {result.isCorrect ? (
                    <i className="ri-checkbox-circle-line w-5 h-5 text-emerald-600 text-lg" />
                  ) : (
                                          <i className="ri-close-circle-line w-5 h-5 text-red-600 text-lg" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.question.word.word}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round(result.timeSpent / 1000)}{t('quiz.averageTime')}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {result.question.question}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-emerald-600 dark:text-emerald-400">
                  {t('quiz.correct')}: {result.question.correctAnswer}
                </div>
                {!result.isCorrect && (
                  <div className="text-red-600 dark:text-red-400">
                    선택: {result.userAnswer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={resetQuiz}
            className="py-3 rounded-xl transition-colors font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--text-secondary)',
              color: 'var(--text-on-accent)'
            }}
          >
                            <i className="ri-refresh-line w-5 h-5 inline mr-2 text-lg" />
            다시 시작
          </button>
          <button
            onClick={onClose}
            className="py-3 rounded-xl transition-colors font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-on-accent)'
            }}
          >
                            <i className="ri-home-line w-5 h-5 inline mr-2 text-lg" />
            단어장으로
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <i className="ri-flashlight-line w-5 h-5 text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'setup' && t('quiz.settings')}
                              {mode === 'quiz' && t('quiz.title')}
                {mode === 'results' && t('quiz.title')}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
          >
                            <i className="ri-close-line w-6 h-6 text-xl" />
          </button>
        </div>

        {/* Content */}
        {mode === 'setup' && renderSetupMode()}
        {mode === 'quiz' && renderQuizMode()}
        {mode === 'results' && renderResultsMode()}
      </div>
    </div>
  );
}