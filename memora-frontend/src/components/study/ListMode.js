import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 

export default function ListMode({ cards, onExit }) {

  // Quiz mode state for ordered list
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

    // Sort cards by order_number
    const sortedCards = [...cards].sort((a, b) => {
    const orderA = a.order_number || 0;
    const orderB = b.order_number || 0;
    return orderA - orderB;
    });

  // Handle toggling quiz mode
  const handleToggleQuizMode = () => {
    setIsQuizMode(!isQuizMode);
    setUserAnswers({});
    setQuizChecked(false);
    setQuizScore({ correct: 0, total: 0 });
  };


  // Handle user answer input
  const handleAnswerChange = (cardId, value) => {
    setUserAnswers({
      ...userAnswers,
      [cardId]: value
    });
  };

  // Check quiz answers
  const handleCheckQuiz = () => {
    let correct = 0;
    const total = cards.length;

    cards.forEach((card, index) => {
    //   const correctOrder = index + 1;
      const correctOrder = card.order_number || 0;  // ✅ CORRECT - use actual order_number

      const userAnswer = parseInt(userAnswers[card.card_id]);
      
      if (userAnswer === correctOrder) {
        correct++;
      }
    });

    setQuizScore({ correct, total });
    setQuizChecked(true);
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizChecked(false);
    setQuizScore({ correct: 0, total: 0 });
  };

    return (
    <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Ordered List Mode</h2>
            <div className="flex items-center gap-4">
            {/* Quiz Mode Toggle */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-sm font-medium text-gray-700">Quiz Mode</span>
                <button
                onClick={handleToggleQuizMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isQuizMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isQuizMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
                </button>
            </div>
            <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <X className="w-4 h-4" /> Exit
            </button>
            </div>
        </div>

        {/* Quiz Instructions */}
        {isQuizMode && !quizChecked && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Quiz Instructions</h3>
            <p className="text-sm text-blue-800">
                Enter the correct order number (1-{sortedCards.length}) for each flashcard based on their content. 
                Click "Check Answers" when you're ready to see your score!
            </p>
            </div>
        )}

        {/* Quiz Results */}
        {isQuizMode && quizChecked && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Quiz Results</h3>
                <button
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                Try Again
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                <div className="text-3xl font-bold text-indigo-600">
                    {quizScore.correct} / {quizScore.total}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {Math.round((quizScore.correct / quizScore.total) * 100)}% Correct
                </div>
                </div>
                <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                    className="bg-indigo-600 h-4 rounded-full transition-all"
                    style={{ width: `${(quizScore.correct / quizScore.total) * 100}%` }}
                    ></div>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Check Answers Button */}
        {isQuizMode && !quizChecked && (
            <div className="mb-6 flex justify-center">
            <button
                onClick={handleCheckQuiz}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
            >
                ✓ Check Answers
            </button>
            </div>
        )}

        <div className="space-y-4">
            {sortedCards.map((card, index) => {
            // const correctOrder = index + 1;
            const correctOrder = card.order_number || (index + 1);
            const userAnswer = parseInt(userAnswers[card.card_id]);
            const isCorrect = userAnswer === correctOrder;
            const showFeedback = isQuizMode && quizChecked;

            return (
                <div
                key={card.card_id}
                className={`bg-white rounded-lg shadow p-6 ${
                    showFeedback ? (isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500') : ''
                }`}
                >
                <div className="flex items-start gap-4">
                    {/* Order Number Display or Input */}
                    {!isQuizMode ? (
                    <div className="bg-indigo-100 text-indigo-600 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {card.order_number || correctOrder}
                    </div>
                    ) : (
                    <div className="flex flex-col items-center gap-1">
                        <input
                        type="number"
                        min="1"
                        max={sortedCards.length}
                        value={userAnswers[card.card_id] || ''}
                        onChange={(e) => handleAnswerChange(card.card_id, e.target.value)}
                        disabled={quizChecked}
                        className={`w-16 px-2 py-1 text-center border-2 rounded-lg font-bold ${
                            showFeedback
                            ? isCorrect
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300'
                        }`}
                        placeholder="#"
                        />
                        {showFeedback && !isCorrect && (
                        <div className="text-xs text-gray-600">
                            Correct: {correctOrder}
                        </div>
                        )}
                    </div>
                    )}

                    {/* Card Content */}
                    <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-2">{card.front_text}</p>
                    <p className="text-gray-600">{card.back_text}</p>
                    {card.category && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                        {card.category}
                        </span>
                    )}
                    </div>

                    {/* Feedback Icon */}
                    {showFeedback && (
                    <div className="flex-shrink-0">
                        {isCorrect ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">✓</span>
                        </div>
                        ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">✗</span>
                        </div>
                        )}
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
        </div>
    </div>
    );
  
}