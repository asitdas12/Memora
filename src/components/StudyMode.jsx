import { useState, useEffect } from 'react'
import './StudyMode.css'

function StudyMode({ deck, onUpdateDeck, onBack }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState(new Set())
  const [sessionProgress, setSessionProgress] = useState([])

  const currentCard = deck.cards[currentCardIndex]
  const totalCards = deck.cards.length

  useEffect(() => {
    // Reset flip when card changes
    setIsFlipped(false)
  }, [currentCardIndex])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const markProgress = (level) => {
    // level: 1 = hard, 2 = medium, 3 = easy
    const updatedCard = { ...currentCard, progress: level }
    const updatedCards = deck.cards.map(c => 
      c.id === currentCard.id ? updatedCard : c
    )
    
    onUpdateDeck({ ...deck, cards: updatedCards })
    
    setStudiedCards(new Set([...studiedCards, currentCard.id]))
    setSessionProgress([...sessionProgress, { cardId: currentCard.id, level }])
    
    // Move to next card
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
    setStudiedCards(new Set())
    setSessionProgress([])
    setIsFlipped(false)
  }

  if (totalCards === 0) {
    return (
      <div className="study-mode">
        <button onClick={onBack} className="back-btn">← Back to Decks</button>
        <div className="no-cards">
          <h2>No cards in this deck</h2>
          <p>Add some cards to start studying!</p>
        </div>
      </div>
    )
  }

  const progressPercentage = (studiedCards.size / totalCards) * 100

  return (
    <div className="study-mode">
      <div className="study-header">
        <button onClick={onBack} className="back-btn">← Back to Decks</button>
        <h2>{deck.name}</h2>
        <div className="study-stats">
          <span>Card {currentCardIndex + 1} of {totalCards}</span>
          <div className="session-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span>{studiedCards.size} cards studied</span>
          </div>
        </div>
      </div>

      <div className="study-content">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-label">Question</div>
              <div className="card-text">{currentCard.front}</div>
              {currentCard.image && !isFlipped && (
                <img src={currentCard.image} alt="Card" className="card-image" />
              )}
              <div className="flip-hint">Click to flip</div>
            </div>
            <div className="flashcard-back">
              <div className="card-label">Answer</div>
              <div className="card-text">{currentCard.back}</div>
              {currentCard.image && isFlipped && (
                <img src={currentCard.image} alt="Card" className="card-image" />
              )}
              <div className="flip-hint">Click to flip</div>
            </div>
          </div>
        </div>

        <div className="study-controls">
          <button 
            onClick={prevCard} 
            disabled={currentCardIndex === 0}
            className="nav-btn"
          >
            ← Previous
          </button>

          {isFlipped && (
            <div className="difficulty-buttons">
              <button 
                onClick={() => markProgress(1)} 
                className="difficulty-btn hard"
              >
                Hard
              </button>
              <button 
                onClick={() => markProgress(2)} 
                className="difficulty-btn medium"
              >
                Medium
              </button>
              <button 
                onClick={() => markProgress(3)} 
                className="difficulty-btn easy"
              >
                Easy
              </button>
            </div>
          )}

          <button 
            onClick={nextCard} 
            disabled={currentCardIndex === totalCards - 1}
            className="nav-btn"
          >
            Next →
          </button>
        </div>

        {currentCardIndex === totalCards - 1 && studiedCards.size === totalCards && (
          <div className="session-complete">
            <h3>🎉 Session Complete!</h3>
            <p>You've studied all {totalCards} cards</p>
            <button onClick={resetSession}>Start Over</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyMode
