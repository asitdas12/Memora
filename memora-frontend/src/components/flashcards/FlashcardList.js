import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 



export default function FlashcardList({
    //  selectedSet, cards, setCards, onBack, onLogout 
  selectedSet, 
  cards, 
  setCards, 
  onBack, 
  onLogout,
  onStartStudyMode,  // Add this prop
  onCardsChanged
}) {
  const [progress, setProgress] = useState(null);
  const [showCardCreator, setShowCardCreator] = useState(false);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [newCard, setNewCard] = useState({ frontText: '', backText: '', category: '', orderNumber: '' });
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studyMode, setStudyMode] = useState(null);

  const loadProgress = async (setId) => {
    try {
      console.log('Loading progress for set:', setId);
      
      const data = await api.getProgress(setId);
      console.log('Progress loaded:', data);
      setProgress(data);
      
    } catch (err) {
      console.error('Failed to load progress:', err);
      // Don't show error to user, progress is optional
    }
  };


  const handleCreateCard = async () => {
    if (!newCard.frontText || !newCard.backText) {
      setError('Both front and back text are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Creating new card...');
      
      const cardData = {
        front_text: newCard.frontText,
        back_text: newCard.backText,
        category: newCard.category || null,
        order_number: newCard.orderNumber ? parseInt(newCard.orderNumber) : (cards.length + 1),
        position_x: Math.random() * 400 + 100,
        position_y: Math.random() * 300 + 100
      };
      
      const createdCard = await api.createCard(selectedSet.set_id, cardData);
      
      console.log('✅ Card created:', createdCard);
      
      // Add to cards list
      setCards([...cards, createdCard]);
      
      // Notify parent to reload sets
      if (onCardsChanged) {
        onCardsChanged();
      }
      
      // Clear form and close modal
      setNewCard({ frontText: '', backText: '', category: '', orderNumber: '' });
      setShowCardCreator(false);
      
    } catch (err) {
      console.error('❌ Failed to create card:', err);
      setError(err.message || 'Failed to create flashcard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Deleting card:', cardId);
      await api.deleteCard(cardId);
      
      console.log('✅ Card deleted');
      
      // Remove from cards list
      setCards(cards.filter(c => c.card_id !== cardId));
      
      // Notify parent to reload sets
      if (onCardsChanged) {
        onCardsChanged();
      }
      
    } catch (err) {
      console.error('❌ Failed to delete card:', err);
      setError(err.message || 'Failed to delete flashcard');
    } finally {
      setLoading(false);
    }
  };
  
  // NEW: Handle editing a card
  const handleEditCard = (card) => {
    setEditingCard({
      card_id: card.card_id,
      frontText: card.front_text,
      backText: card.back_text,
      category: card.category || '',
      orderNumber: card.order_number || ''
    });
    setShowCardEditor(true);
  };

  // NEW: Handle updating a card with API
  const handleUpdateCard = async () => {
    if (!editingCard.frontText || !editingCard.backText) {
      setError('Both front and back text are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Updating card:', editingCard.card_id);
      
      // Prepare update data matching your api.js expectations
      const cardData = {
        front_text: editingCard.frontText,
        back_text: editingCard.backText,
        category: editingCard.category || null,
        order_number: editingCard.orderNumber ? parseInt(editingCard.orderNumber) : null
      };
      
      const updatedCard = await api.updateCard(editingCard.card_id, cardData);
      
      console.log('✅ Card updated:', updatedCard);
      
      // Update the card in the cards list
      setCards(cards.map(c => 
        c.card_id === updatedCard.card_id ? updatedCard : c
      ));
      
      // Clear form and close modal
      setEditingCard(null);
      setShowCardEditor(false);
      
    } catch (err) {
      console.error('❌ Failed to update card:', err);
      setError(err.message || 'Failed to update flashcard');
    } finally {
      setLoading(false);
    }
  };

  const startStudyMode = (mode) => {
    onStartStudyMode(mode);  // Call parent function
  };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{selectedSet.title}</h1>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {progress && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
                <span className="text-2xl font-bold text-indigo-600">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{progress.mastered} of {progress.total} cards mastered</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Modes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => startStudyMode('flip')} className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <span className="font-medium">Flip</span>
              </button>
              <button onClick={() => startStudyMode('list')} className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                <List className="w-8 h-8 text-indigo-600" />
                <span className="font-medium">List</span>
              </button>
              <button onClick={() => startStudyMode('categorical')} className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                <Grid className="w-8 h-8 text-indigo-600" />
                <span className="font-medium">Categorical</span>
              </button>
              <button onClick={() => startStudyMode('whiteboard')} className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition">
                <Layout className="w-8 h-8 text-indigo-600" />
                <span className="font-medium">Whiteboard</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Flashcards ({cards.length})</h3>
              <button onClick={() => setShowCardCreator(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> New Card
              </button>
            </div>
            <div className="p-6 space-y-4">
              {cards.map((card, index) => (
                <div key={card.card_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{card.front_text}</p>
                      <p className="text-gray-600 text-sm mb-2">{card.back_text}</p>
                      {card.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          {card.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCard(card)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCard(card.card_id)} className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showCardCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Create New Flashcard</h3>
                <button onClick={() => setShowCardCreator(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Front (Question)</label>
                  <textarea
                    value={newCard.frontText}
                    onChange={(e) => setNewCard({ ...newCard, frontText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="What is the question?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Back (Answer)</label>
                  <textarea
                    value={newCard.backText}
                    onChange={(e) => setNewCard({ ...newCard, backText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="What is the answer?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                  <input
                    type="text"
                    value={newCard.category}
                    onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Cell Biology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={newCard.orderNumber}
                    onChange={(e) => setNewCard({ ...newCard, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Default: ${cards.length + 1}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to auto-assign</p>
                </div>
                <button 
                  onClick={handleCreateCard} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Editor Modal */}
        {showCardEditor && editingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Edit Flashcard</h3>
                <button onClick={() => { setShowCardEditor(false); setEditingCard(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Front (Question)</label>
                  <textarea
                    value={editingCard.frontText}
                    onChange={(e) => setEditingCard({ ...editingCard, frontText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="What is the question?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Back (Answer)</label>
                  <textarea
                    value={editingCard.backText}
                    onChange={(e) => setEditingCard({ ...editingCard, backText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="What is the answer?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                  <input
                    type="text"
                    value={editingCard.category}
                    onChange={(e) => setEditingCard({ ...editingCard, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Cell Biology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCard.orderNumber}
                    onChange={(e) => setEditingCard({ ...editingCard, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter order number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current order</p>
                </div>
                <button 
                  onClick={handleUpdateCard} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Updating...' : 'Update Card'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );


}