import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 

export default function CategoryMode({ cards, onExit }) {

  // Quiz mode state for categorical view
  const [isCategoryQuizMode, setIsCategoryQuizMode] = useState(false);
  const [categoryAnswers, setCategoryAnswers] = useState({});
  const [categoryQuizChecked, setCategoryQuizChecked] = useState(false);
  const [categoryQuizScore, setCategoryQuizScore] = useState({ correct: 0, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const groupCardsByCategory = () => {
    const grouped = {};
    cards.forEach(card => {
      const cat = card.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(card);
    });
    return grouped;
  };

  // Handle toggling category quiz mode
  const handleToggleCategoryQuizMode = () => {
    setIsCategoryQuizMode(!isCategoryQuizMode);
    setCategoryAnswers({});
    setCategoryQuizChecked(false);
    setCategoryQuizScore({ correct: 0, total: 0 });
    setSelectedCategory(null);
  };

  // Handle category selection
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  // Handle assigning category to card
  const handleAssignCategoryToCard = (cardId) => {
    if (!selectedCategory) return;
    
    setCategoryAnswers({
      ...categoryAnswers,
      [cardId]: selectedCategory
    });
  };

  // Check category quiz answers
  const handleCheckCategoryQuiz = () => {
    let correct = 0;
    const total = cards.length;

    cards.forEach((card) => {
      const correctCategory = card.category || 'Uncategorized';
      const userAnswer = categoryAnswers[card.card_id];
      
      if (userAnswer === correctCategory) {
        correct++;
      }
    });

    setCategoryQuizScore({ correct, total });
    setCategoryQuizChecked(true);
  };

  // Reset category quiz
  const handleResetCategoryQuiz = () => {
    setCategoryAnswers({});
    setCategoryQuizChecked(false);
    setCategoryQuizScore({ correct: 0, total: 0 });
    setSelectedCategory(null);
  };

    const grouped = groupCardsByCategory();
    const categories = Object.keys(grouped);

    return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Categorical Mode</h2>
            <div className="flex items-center gap-4">
            {/* Quiz Mode Toggle */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-sm font-medium text-gray-700">Quiz Mode</span>
                <button
                onClick={handleToggleCategoryQuizMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isCategoryQuizMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isCategoryQuizMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
                </button>
            </div>
            <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <X className="w-4 h-4" /> Exit
            </button>
            </div>
        </div>

        {/* Quiz Mode UI */}
        {isCategoryQuizMode ? (
            <>
            {/* Quiz Instructions */}
            {!categoryQuizChecked && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📝 Quiz Instructions</h3>
                <p className="text-sm text-blue-800 mb-2">
                    1. Click on a category button below to select it
                </p>
                <p className="text-sm text-blue-800 mb-2">
                    2. Click on flashcards to assign the selected category to them
                </p>
                <p className="text-sm text-blue-800">
                    3. Click "Check Answers" when you're done to see your score!
                </p>
                </div>
            )}

            {/* Category Selection Buttons */}
            {!categoryQuizChecked && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Category:</h3>
                <div className="flex flex-wrap gap-3">
                    {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => handleSelectCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedCategory === category
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {category}
                    </button>
                    ))}
                </div>
                {selectedCategory && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-900">
                        <strong>Selected:</strong> {selectedCategory} - Now click on cards to assign this category
                    </p>
                    </div>
                )}
                </div>
            )}

            {/* Quiz Results */}
            {categoryQuizChecked && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Quiz Results</h3>
                    <button
                    onClick={handleResetCategoryQuiz}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                    Try Again
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                    <div className="text-3xl font-bold text-indigo-600">
                        {categoryQuizScore.correct} / {categoryQuizScore.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {Math.round((categoryQuizScore.correct / categoryQuizScore.total) * 100)}% Correct
                    </div>
                    </div>
                    <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                        className="bg-indigo-600 h-4 rounded-full transition-all"
                        style={{ width: `${(categoryQuizScore.correct / categoryQuizScore.total) * 100}%` }}
                        ></div>
                    </div>
                    </div>
                </div>
                </div>
            )}

            {/* Check Answers Button */}
            {!categoryQuizChecked && (
                <div className="mb-6 flex justify-center">
                <button
                    onClick={handleCheckCategoryQuiz}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
                >
                    ✓ Check Answers
                </button>
                </div>
            )}

            {/* All Cards in Quiz Mode */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Flashcards ({Object.keys(categoryAnswers).length} / {cards.length} assigned)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(card => {
                    const correctCategory = card.category || 'Uncategorized';
                    const userAnswer = categoryAnswers[card.card_id];
                    const isCorrect = userAnswer === correctCategory;
                    const showFeedback = categoryQuizChecked;
                    const hasAnswer = userAnswer !== undefined;

                    return (
                    <div
                        key={card.card_id}
                        onClick={() => !categoryQuizChecked && handleAssignCategoryToCard(card.card_id)}
                        className={`rounded-lg shadow p-4 transition cursor-pointer ${
                        showFeedback
                            ? isCorrect
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-red-50 border-2 border-red-500'
                            : hasAnswer
                            ? 'bg-indigo-50 border-2 border-indigo-300 hover:shadow-lg'
                            : 'bg-white border-2 border-gray-200 hover:shadow-lg hover:border-indigo-300'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800 text-sm">{card.front_text}</p>
                        {showFeedback && (
                            <div className="flex-shrink-0">
                            {isCorrect ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            ) : (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✗</span>
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                        <p className="text-gray-600 text-xs mb-3">{card.back_text}</p>
                        
                        {/* Show assigned category */}
                        {hasAnswer && (
                        <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            showFeedback
                                ? isCorrect
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                                : 'bg-indigo-200 text-indigo-800'
                            }`}>
                            Your answer: {userAnswer}
                            </span>
                        </div>
                        )}
                        
                        {/* Show correct answer if wrong */}
                        {showFeedback && !isCorrect && (
                        <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                            Correct: {correctCategory}
                            </span>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            </div>
            </>
        ) : (
            /* Normal Categorical View */
            <div className="space-y-8">
            {Object.entries(grouped).map(([category, categoryCards]) => (
                <div key={category}>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryCards.map(card => (
                    <div key={card.card_id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                        <p className="font-semibold text-gray-800 mb-2">{card.front_text}</p>
                        <p className="text-sm text-gray-600">{card.back_text}</p>
                    </div>
                    ))}
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    </div>
    );

  
}