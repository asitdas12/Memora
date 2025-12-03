import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 

export default function Dashboard({
  user, 
  sets, 
  error, 
  loading,
  onSelectSet, 
  onLogout,
  onCreateSet,
  onDeleteSet 
}) {

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