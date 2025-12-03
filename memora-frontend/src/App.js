import React, { useState, useEffect } from 'react';
import LoginForm from './components/auth/LoginForm';
import FlipMode from './components/study/FlipMode';
import ListMode from './components/study/ListMode';
import CategoryMode from './components/study/CategoryMode';
import WhiteboardMode from './components/study/WhiteboardMode';
// import Dashboard from './components/dashboard/Dashboard';

import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from './api'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [studyMode, setStudyMode] = useState(null);
  const [progress, setProgress] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isRegistering, setIsRegistering] = useState(false);

  const [showCardCreator, setShowCardCreator] = useState(false);
  const [showSetCreator, setShowSetCreator] = useState(false);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [newCard, setNewCard] = useState({ frontText: '', backText: '', category: '', orderNumber: '' });
  const [newSet, setNewSet] = useState({ title: '', description: '' });
  const [editingCard, setEditingCard] = useState(null);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz mode state for ordered list
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Quiz mode state for categorical view
  const [isCategoryQuizMode, setIsCategoryQuizMode] = useState(false);
  const [categoryAnswers, setCategoryAnswers] = useState({});
  const [categoryQuizChecked, setCategoryQuizChecked] = useState(false);
  const [categoryQuizScore, setCategoryQuizScore] = useState({ correct: 0, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [passwordFocused, setPasswordFocused] = useState(false);

  
  useEffect(() => {
    if (user && currentView === 'dashboard') {
      loadSets();
    }
  }, [user, currentView]);

  useEffect(() => {
    if (selectedSet) {
      loadCards(selectedSet.set_id);
      loadProgress(selectedSet.set_id);
    }
  }, [selectedSet]);

  const loadSets = async () => {
    try {
      setLoading(true);
      console.log('Loading flashcard sets...');
      
      const data = await api.getSets();
      console.log('Sets loaded:', data);
      setSets(data);
      
    } catch (err) {
      console.error('Failed to load sets:', err);
      setError('Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async (setId) => {
    try {
      setLoading(true);
      console.log('Loading cards for set:', setId);
      
      const data = await api.getCards(setId);
      console.log('Cards loaded:', data);
      setCards(data);
      
    } catch (err) {
      console.error('Failed to load cards:', err);
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

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


  const handleLogout = () => {
    api.clearAuthToken();
    setUser(null);
    setCurrentView('login');
    setSelectedSet(null);
    setCards([]);
    setEmail('');
    setPassword('');
    setError('');
  };

  // NEW: Handle creating a flashcard set
  const handleCreateSet = async () => {
    if (!newSet.title) {
      setError('Set title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Creating new set...');
      const createdSet = await api.createSet(newSet.title, newSet.description);
      
      console.log('✅ Set created:', createdSet);
      
      // Add to sets list
      setSets([...sets, createdSet]);
      
      // Clear form and close modal
      setNewSet({ title: '', description: '' });
      setShowSetCreator(false);
      
    } catch (err) {
      console.error('❌ Failed to create set:', err);
      setError(err.message || 'Failed to create flashcard set');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Handle creating a card with API
  const handleCreateCard = async () => {
    if (!newCard.frontText || !newCard.backText) {
      setError('Both front and back text are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Creating new card...');
      
      // Prepare card data matching your api.js expectations
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

  // UPDATED: Handle deleting a card with API
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

  // NEW: Handle deleting a flashcard set
  const handleDeleteSet = async (setId, e) => {
    // Prevent the click from bubbling up to the parent div (which opens the set)
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this flashcard set? This will delete all cards in the set.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Deleting set:', setId);
      await api.deleteSet(setId);
      
      console.log('✅ Set deleted');
      
      // Remove from sets list
      setSets(sets.filter(s => s.set_id !== setId));
      
    } catch (err) {
      console.error('❌ Failed to delete set:', err);
      setError(err.message || 'Failed to delete flashcard set');
    } finally {
      setLoading(false);
    }
  };

  const startStudyMode = (mode) => {
    setStudyMode(mode);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const exitStudyMode = () => {
    setStudyMode(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    // Reset quiz mode state for ordered list
    setIsQuizMode(false);
    setUserAnswers({});
    setQuizChecked(false);
    setQuizScore({ correct: 0, total: 0 });
    // Reset quiz mode state for categorical view
    setIsCategoryQuizMode(false);
    setCategoryAnswers({});
    setCategoryQuizChecked(false);
    setCategoryQuizScore({ correct: 0, total: 0 });
    setSelectedCategory(null);
  };

  if (!user) {
    return (
      <LoginForm 
        onLoginSuccess={(user) => {
          setUser(user);
          setCurrentView('dashboard');
        }} 
      />
    );

  }

  if (studyMode) {
    const currentCard = cards[currentCardIndex];
    
    if (studyMode === 'flip') {
      return <FlipMode cards={cards} onExit={exitStudyMode} />;
    }

    if (studyMode === 'list') {

      return <ListMode 
        cards={cards} 
        onExit={exitStudyMode} 
      />;

    }

    if (studyMode === 'categorical') {

      return <CategoryMode 
        cards={cards} 
        onExit={exitStudyMode} 
      />;
      
    }

    if (studyMode === 'whiteboard') {
      return <WhiteboardMode 
        cards={cards} 
        onExit={exitStudyMode} 
      />;
    }
  }

  if (selectedSet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedSet(null)} className="text-gray-600 hover:text-gray-800">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{selectedSet.title}</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
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


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Memora</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Flashcard Sets</h2>
          <button 
            onClick={() => setShowSetCreator(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg"
          >
            <Plus className="w-5 h-5" /> New Set
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map(set => (
            <div
              key={set.set_id}
              onClick={() => setSelectedSet(set)}
              className="bg-white rounded-lg shadow hover:shadow-xl transition cursor-pointer p-6 relative group"
            >
              {/* Delete button - appears on hover */}
              <button
                onClick={(e) => handleDeleteSet(set.set_id, e)}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Delete set"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <span className="text-sm text-gray-500">{set.card_count} cards</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{set.title}</h3>
              <p className="text-gray-600 text-sm">{set.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Set Creator Modal */}
      {showSetCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Create New Flashcard Set</h3>
              <button onClick={() => setShowSetCreator(false)} className="text-gray-400 hover:text-gray-600">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Title *</label>
                <input
                  type="text"
                  value={newSet.title}
                  onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Biology Chapter 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newSet.description}
                  onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Brief description of this flashcard set"
                />
              </div>
              <button 
                onClick={handleCreateSet}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Set'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}