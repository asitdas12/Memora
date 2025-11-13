import { useState } from 'react'
import DeckList from './DeckList'
import CardEditor from './CardEditor'
import StudyMode from './StudyMode'
import './Dashboard.css'

function Dashboard({ user, decks, updateDecks, onLogout }) {
  const [currentView, setCurrentView] = useState('decks')
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'whiteboard'

  const createDeck = () => {
    const name = prompt('Enter deck name:')
    if (name) {
      const newDeck = {
        id: Date.now(),
        name,
        cards: []
      }
      updateDecks([...decks, newDeck])
    }
  }

  const deleteDeck = (deckId) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      updateDecks(decks.filter(d => d.id !== deckId))
    }
  }

  const updateDeck = (updatedDeck) => {
    updateDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d))
  }

  const selectDeck = (deck) => {
    setSelectedDeck(deck)
    setCurrentView('edit')
  }

  const studyDeck = (deck) => {
    setSelectedDeck(deck)
    setCurrentView('study')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Memora</h1>
        <div className="header-controls">
          <span>Welcome, {user.name}!</span>
          <div className="view-toggle">
            <button 
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
            >
              Cards View
            </button>
            <button 
              className={viewMode === 'whiteboard' ? 'active' : ''}
              onClick={() => setViewMode('whiteboard')}
            >
              Whiteboard (Coming Soon)
            </button>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {currentView === 'decks' && (
          <DeckList 
            decks={decks}
            onSelectDeck={selectDeck}
            onStudyDeck={studyDeck}
            onDeleteDeck={deleteDeck}
            onCreateDeck={createDeck}
          />
        )}

        {currentView === 'edit' && selectedDeck && (
          <CardEditor
            deck={selectedDeck}
            onSave={updateDeck}
            onBack={() => setCurrentView('decks')}
          />
        )}

        {currentView === 'study' && selectedDeck && (
          <StudyMode
            deck={selectedDeck}
            onUpdateDeck={updateDeck}
            onBack={() => setCurrentView('decks')}
          />
        )}
      </main>
    </div>
  )
}

export default Dashboard
