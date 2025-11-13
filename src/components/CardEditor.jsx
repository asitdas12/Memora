import { useState } from 'react'
import './CardEditor.css'

function CardEditor({ deck, onSave, onBack }) {
  const [cards, setCards] = useState(deck.cards)
  const [editingCard, setEditingCard] = useState(null)
  const [newCard, setNewCard] = useState({ front: '', back: '', image: null })

  const addCard = () => {
    if (newCard.front && newCard.back) {
      const card = {
        id: Date.now(),
        ...newCard,
        progress: 0
      }
      setCards([...cards, card])
      setNewCard({ front: '', back: '', image: null })
    }
  }

  const deleteCard = (cardId) => {
    setCards(cards.filter(c => c.id !== cardId))
  }

  const startEdit = (card) => {
    setEditingCard({ ...card })
  }

  const saveEdit = () => {
    setCards(cards.map(c => c.id === editingCard.id ? editingCard : c))
    setEditingCard(null)
  }

  const cancelEdit = () => {
    setEditingCard(null)
  }

  const handleImageUpload = (e, isNewCard = true) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isNewCard) {
          setNewCard({ ...newCard, image: reader.result })
        } else {
          setEditingCard({ ...editingCard, image: reader.result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const saveDeck = () => {
    onSave({ ...deck, cards })
    onBack()
  }

  return (
    <div className="card-editor">
      <div className="editor-header">
        <button onClick={onBack} className="back-btn">← Back to Decks</button>
        <h2>Edit Deck: {deck.name}</h2>
        <button onClick={saveDeck} className="save-btn">Save Deck</button>
      </div>

      <div className="add-card-section">
        <h3>Add New Card</h3>
        <div className="card-form">
          <div className="form-group">
            <label>Front:</label>
            <textarea
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              placeholder="Enter question or prompt"
            />
          </div>
          <div className="form-group">
            <label>Back:</label>
            <textarea
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              placeholder="Enter answer or explanation"
            />
          </div>
          <div className="form-group">
            <label>Image (optional):</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
            />
            {newCard.image && (
              <img src={newCard.image} alt="Card" className="image-preview" />
            )}
          </div>
          <button onClick={addCard} className="add-btn">Add Card</button>
        </div>
      </div>

      <div className="cards-list">
        <h3>Cards ({cards.length})</h3>
        {cards.map(card => (
          <div key={card.id} className="card-item">
            {editingCard && editingCard.id === card.id ? (
              <div className="card-edit-form">
                <textarea
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                />
                <textarea
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                {editingCard.image && (
                  <img src={editingCard.image} alt="Card" className="image-preview" />
                )}
                <div className="edit-actions">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit} className="secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="card-display">
                <div className="card-content">
                  <strong>Front:</strong> {card.front}
                  <br />
                  <strong>Back:</strong> {card.back}
                  {card.image && <img src={card.image} alt="Card" className="card-image-small" />}
                </div>
                <div className="card-actions">
                  <button onClick={() => startEdit(card)} className="secondary">Edit</button>
                  <button onClick={() => deleteCard(card.id)} className="danger">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardEditor
