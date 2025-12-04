import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 

// metrics
import { metrics } from '../../services/metrics';

export default function FlipMode({ cards, onExit }) {

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = cards[currentCardIndex];


  // metrics
  const handleFlip = () => {
    const start = Date.now();
    setIsFlipped(!isFlipped);
    const duration = Date.now() - start;
    metrics.trackLatency('flip_card', duration);
  };

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };


    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Flip Mode</h2>
            <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <X className="w-4 h-4" /> Exit
            </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-8">
            <button onClick={prevCard} disabled={currentCardIndex === 0} className="p-2 bg-white rounded-full shadow-lg disabled:opacity-50">
            <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-2xl min-h-80 flex items-center justify-center cursor-pointer hover:shadow-3xl transition transform hover:scale-105"
            >
            <p className="text-2xl text-center text-gray-800">
                {isFlipped ? currentCard.back_text : currentCard.front_text}
            </p>
            </div>
            
            <button onClick={nextCard} disabled={currentCardIndex === cards.length - 1} className="p-2 bg-white rounded-full shadow-lg disabled:opacity-50">
            <ChevronRight className="w-6 h-6" />
            </button>
        </div>
        
        <div className="text-center text-gray-600">
            Card {currentCardIndex + 1} of {cards.length}
            <div className="text-sm mt-2">Click card to flip</div>
        </div>
        </div>
    </div>
    );
  
}