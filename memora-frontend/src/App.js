import React, { useState, useEffect } from 'react';
import LoginForm from './components/auth/LoginForm';
import FlipMode from './components/study/FlipMode';
import ListMode from './components/study/ListMode';
import CategoryMode from './components/study/CategoryMode';
import WhiteboardMode from './components/study/WhiteboardMode';
import FlashcardList from './components/flashcards/FlashcardList';
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

  // const [showCardCreator, setShowCardCreator] = useState(false);
  const [showSetCreator, setShowSetCreator] = useState(false);
  // const [showCardEditor, setShowCardEditor] = useState(false);
  // const [newCard, setNewCard] = useState({ frontText: '', backText: '', category: '', orderNumber: '' });
  const [newSet, setNewSet] = useState({ title: '', description: '' });
  // const [editingCard, setEditingCard] = useState(null);

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

  const loadProgress = async (setId) => { //TODO DELETE
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

    // Check if we're in a study mode
    if (studyMode) {
      if (studyMode === 'flip') {
        return <FlipMode cards={cards} onExit={exitStudyMode} />;
      }
      if (studyMode === 'list') {
        return <ListMode cards={cards} onExit={exitStudyMode} />;
      }
      if (studyMode === 'categorical') {
        return <CategoryMode cards={cards} onExit={exitStudyMode} />;
      }
      if (studyMode === 'whiteboard') {
        return <WhiteboardMode cards={cards} onExit={exitStudyMode} />;
      }
    }

    // Otherwise show the flashcard list
    return <FlashcardList 
      selectedSet={selectedSet}
      cards={cards}
      setCards={setCards}
      onBack={() => setSelectedSet(null)}  // Fix: was calling exitStudyMode
      onLogout={handleLogout}
      onStartStudyMode={startStudyMode}  // Pass this function down
      onCardsChanged={loadSets}  // Add this - reload sets when cards change
    />;

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