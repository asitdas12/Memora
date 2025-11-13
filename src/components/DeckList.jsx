import './DeckList.css'

function DeckList({ decks, onSelectDeck, onStudyDeck, onDeleteDeck, onCreateDeck }) {
  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>My Decks</h2>
        <button onClick={onCreateDeck} className="create-deck-btn">
          + Create New Deck
        </button>
      </div>
      
      <div className="decks-grid">
        {decks.map(deck => (
          <div key={deck.id} className="deck-card">
            <h3>{deck.name}</h3>
            <p>{deck.cards.length} cards</p>
            <div className="deck-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${deck.cards.length > 0 
                      ? (deck.cards.filter(c => c.progress > 0).length / deck.cards.length) * 100 
                      : 0}%`
                  }}
                />
              </div>
              <span className="progress-text">
                {deck.cards.filter(c => c.progress > 0).length} / {deck.cards.length} studied
              </span>
            </div>
            <div className="deck-actions">
              <button onClick={() => onStudyDeck(deck)} className="study-btn">
                Study
              </button>
              <button onClick={() => onSelectDeck(deck)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => onDeleteDeck(deck.id)} className="delete-btn danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckList
