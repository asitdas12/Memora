const { useState, useEffect } = React;

// Utility function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Main App Component
function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('login');

    useEffect(() => {
        // Check if user is logged in (from localStorage)
        const savedUser = localStorage.getItem('memora_user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
            setCurrentView('dashboard');
        }
    }, []);

    const handleLogin = (email) => {
        const user = { email, name: email.split('@')[0] };
        localStorage.setItem('memora_user', JSON.stringify(user));
        setCurrentUser(user);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('memora_user');
        setCurrentUser(null);
        setCurrentView('login');
    };

    if (!currentUser) {
        if (currentView === 'login') {
            return <LoginPage onLogin={handleLogin} onNavigate={setCurrentView} />;
        } else if (currentView === 'register') {
            return <RegisterPage onNavigate={setCurrentView} />;
        } else if (currentView === 'forgot-password') {
            return <ForgotPasswordPage onNavigate={setCurrentView} />;
        }
    }

    return <MainApp user={currentUser} onLogout={handleLogout} />;
}

// Login Page
function LoginPage({ onLogin, onNavigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Memora</h1>
                    <p>Welcome back! Please login to your account.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Sign In
                    </button>
                </form>
                <div className="auth-links">
                    <a href="#" onClick={() => onNavigate('forgot-password')}>
                        Forgot password?
                    </a>
                    <div className="auth-divider">or</div>
                    <a href="#" onClick={() => onNavigate('register')}>
                        Don't have an account? Sign up
                    </a>
                </div>
            </div>
        </div>
    );
}

// Register Page
function RegisterPage({ onNavigate }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Registration successful! Please login.');
        onNavigate('login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Memora</h1>
                    <p>Create your account to get started.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Create Account
                    </button>
                </form>
                <div className="auth-links">
                    <a href="#" onClick={() => onNavigate('login')}>
                        Already have an account? Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}

// Forgot Password Page
function ForgotPasswordPage({ onNavigate }) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">
                        <h1>Memora</h1>
                        <p>Check your email</p>
                    </div>
                    <p style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => onNavigate('login')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>Memora</h1>
                    <p>Enter your email to reset your password.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Send Reset Link
                    </button>
                </form>
                <div className="auth-links">
                    <a href="#" onClick={() => onNavigate('login')}>
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}

// Main App (Dashboard and functionality)
function MainApp({ user, onLogout }) {
    const [decks, setDecks] = useState([]);
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [studyMode, setStudyMode] = useState(false);

    useEffect(() => {
        // Load decks from localStorage
        const savedDecks = localStorage.getItem('memora_decks');
        if (savedDecks) {
            setDecks(JSON.parse(savedDecks));
        } else {
            // Initialize with sample data
            const sampleDecks = [
                {
                    id: generateId(),
                    name: 'Sample Deck',
                    description: 'Your first flashcard deck',
                    cards: [
                        {
                            id: generateId(),
                            front: 'Welcome to Memora!',
                            back: 'Create flashcards to study more effectively',
                            image: null,
                            tags: ['intro']
                        }
                    ],
                    createdAt: new Date().toISOString()
                }
            ];
            setDecks(sampleDecks);
            localStorage.setItem('memora_decks', JSON.stringify(sampleDecks));
        }
    }, []);

    useEffect(() => {
        // Save decks to localStorage whenever they change
        if (decks.length > 0) {
            localStorage.setItem('memora_decks', JSON.stringify(decks));
        }
    }, [decks]);

    const handleCreateDeck = (deckData) => {
        const newDeck = {
            id: generateId(),
            ...deckData,
            cards: [],
            createdAt: new Date().toISOString()
        };
        setDecks([...decks, newDeck]);
    };

    const handleDeleteDeck = (deckId) => {
        if (confirm('Are you sure you want to delete this deck?')) {
            setDecks(decks.filter(d => d.id !== deckId));
        }
    };

    const handleEditDeck = (deckId, updatedData) => {
        setDecks(decks.map(d => d.id === deckId ? { ...d, ...updatedData } : d));
    };

    const handleViewDeck = (deck) => {
        setSelectedDeck(deck);
        setCurrentView('deck-detail');
    };

    const handleStudyDeck = (deck) => {
        setSelectedDeck(deck);
        setStudyMode(true);
    };

    const handleAddCard = (deckId, cardData) => {
        const newCard = {
            id: generateId(),
            ...cardData
        };
        setDecks(decks.map(d => {
            if (d.id === deckId) {
                return { ...d, cards: [...d.cards, newCard] };
            }
            return d;
        }));
    };

    const handleEditCard = (deckId, cardId, updatedCard) => {
        setDecks(decks.map(d => {
            if (d.id === deckId) {
                return {
                    ...d,
                    cards: d.cards.map(c => c.id === cardId ? { ...c, ...updatedCard } : c)
                };
            }
            return d;
        }));
    };

    const handleDeleteCard = (deckId, cardId) => {
        if (confirm('Are you sure you want to delete this card?')) {
            setDecks(decks.map(d => {
                if (d.id === deckId) {
                    return {
                        ...d,
                        cards: d.cards.filter(c => c.id !== cardId)
                    };
                }
                return d;
            }));
        }
    };

    if (studyMode && selectedDeck) {
        return (
            <div className="app-container">
                <StudyMode
                    deck={selectedDeck}
                    onExit={() => {
                        setStudyMode(false);
                        setCurrentView('dashboard');
                    }}
                />
            </div>
        );
    }

    return (
        <div className="app-container">
            <Navbar user={user} onLogout={onLogout} />
            <div className="main-content">
                {currentView === 'dashboard' && (
                    <Dashboard
                        decks={decks}
                        onCreateDeck={handleCreateDeck}
                        onDeleteDeck={handleDeleteDeck}
                        onViewDeck={handleViewDeck}
                        onStudyDeck={handleStudyDeck}
                    />
                )}
                {currentView === 'deck-detail' && selectedDeck && (
                    <DeckDetail
                        deck={selectedDeck}
                        onBack={() => setCurrentView('dashboard')}
                        onAddCard={(cardData) => handleAddCard(selectedDeck.id, cardData)}
                        onEditCard={(cardId, cardData) => handleEditCard(selectedDeck.id, cardId, cardData)}
                        onDeleteCard={(cardId) => handleDeleteCard(selectedDeck.id, cardId)}
                        onStudy={() => setStudyMode(true)}
                    />
                )}
            </div>
        </div>
    );
}

// Navbar Component
function Navbar({ user, onLogout }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Memora</div>
            <div className="navbar-menu">
                <div className="navbar-user">
                    <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                    <button className="btn btn-small btn-secondary" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

// Dashboard Component
function Dashboard({ decks, onCreateDeck, onDeleteDeck, onViewDeck, onStudyDeck }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);

    return (
        <>
            <div className="dashboard-header">
                <h1>Welcome to Memora</h1>
                <p>Your intelligent flashcard study companion</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Decks</h3>
                    <div className="stat-value">{decks.length}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Cards</h3>
                    <div className="stat-value">{totalCards}</div>
                </div>
                <div className="stat-card">
                    <h3>Study Streak</h3>
                    <div className="stat-value">0 days</div>
                </div>
            </div>

            <div className="section-header">
                <h2>My Decks</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create New Deck
                </button>
            </div>

            {decks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3>No decks yet</h3>
                    <p>Create your first flashcard deck to get started</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Create Your First Deck
                    </button>
                </div>
            ) : (
                <div className="decks-grid">
                    {decks.map(deck => (
                        <div key={deck.id} className="deck-card">
                            <h3>{deck.name}</h3>
                            <p>{deck.description}</p>
                            <div className="deck-meta">
                                <span>{deck.cards.length} cards</span>
                                <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="deck-actions">
                                <button 
                                    className="btn btn-primary btn-small"
                                    onClick={() => onViewDeck(deck)}
                                >
                                    View
                                </button>
                                {deck.cards.length > 0 && (
                                    <button 
                                        className="btn btn-secondary btn-small"
                                        onClick={() => onStudyDeck(deck)}
                                    >
                                        Study
                                    </button>
                                )}
                                <button 
                                    className="icon-btn"
                                    onClick={() => onDeleteDeck(deck.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateDeckModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={(data) => {
                        onCreateDeck(data);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </>
    );
}

// Create Deck Modal
function CreateDeckModal({ onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, description });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Deck</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Deck Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Biology Chapter 5"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this deck"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Deck
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Deck Detail Component
function DeckDetail({ deck, onBack, onAddCard, onEditCard, onDeleteCard, onStudy }) {
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const handleEditCard = (card) => {
        setEditingCard(card);
        setShowCardModal(true);
    };

    const handleCloseModal = () => {
        setShowCardModal(false);
        setEditingCard(null);
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <button className="btn btn-secondary btn-small" onClick={onBack}>
                        ← Back
                    </button>
                    <h2 style={{ color: 'white', marginTop: '16px' }}>{deck.name}</h2>
                    <p style={{ color: 'white', opacity: 0.9 }}>{deck.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {deck.cards.length > 0 && (
                        <button className="btn btn-primary" onClick={onStudy}>
                            Study Now
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => setShowCardModal(true)}>
                        + Add Card
                    </button>
                </div>
            </div>

            {deck.cards.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>No cards yet</h3>
                    <p>Add your first flashcard to this deck</p>
                    <button className="btn btn-primary" onClick={() => setShowCardModal(true)}>
                        Create First Card
                    </button>
                </div>
            ) : (
                <div className="decks-grid">
                    {deck.cards.map(card => (
                        <div key={card.id} className="deck-card">
                            <h3>Front: {card.front}</h3>
                            <p>Back: {card.back}</p>
                            {card.image && (
                                <img src={card.image} alt="Card" style={{ width: '100%', marginTop: '12px', borderRadius: '8px' }} />
                            )}
                            {card.tags && card.tags.length > 0 && (
                                <div className="tags-container" style={{ marginTop: '12px' }}>
                                    {card.tags.map((tag, idx) => (
                                        <span key={idx} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div className="deck-actions" style={{ marginTop: '16px' }}>
                                <button 
                                    className="icon-btn"
                                    onClick={() => handleEditCard(card)}
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="icon-btn"
                                    onClick={() => onDeleteCard(card.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCardModal && (
                <CardEditorModal
                    card={editingCard}
                    onClose={handleCloseModal}
                    onSubmit={(cardData) => {
                        if (editingCard) {
                            onEditCard(editingCard.id, cardData);
                        } else {
                            onAddCard(cardData);
                        }
                        handleCloseModal();
                    }}
                />
            )}
        </>
    );
}

// Card Editor Modal
function CardEditorModal({ card, onClose, onSubmit }) {
    const [front, setFront] = useState(card?.front || '');
    const [back, setBack] = useState(card?.back || '');
    const [image, setImage] = useState(card?.image || null);
    const [tags, setTags] = useState(card?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [currentSide, setCurrentSide] = useState('front');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ front, back, image, tags });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{card ? 'Edit Card' : 'Create New Card'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="editor-tabs">
                        <button
                            type="button"
                            className={`tab-btn ${currentSide === 'front' ? 'active' : ''}`}
                            onClick={() => setCurrentSide('front')}
                        >
                            Front
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${currentSide === 'back' ? 'active' : ''}`}
                            onClick={() => setCurrentSide('back')}
                        >
                            Back
                        </button>
                    </div>

                    {currentSide === 'front' ? (
                        <div className="form-group">
                            <label>Front Content</label>
                            <textarea
                                value={front}
                                onChange={(e) => setFront(e.target.value)}
                                placeholder="Enter the question or prompt"
                                required
                                rows="4"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e1e8ed', fontSize: '15px' }}
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Back Content</label>
                            <textarea
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                placeholder="Enter the answer"
                                required
                                rows="4"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e1e8ed', fontSize: '15px' }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {image && (
                            <div className="card-preview has-content">
                                <img src={image} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="tags-input">
                        <label>Tags</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add a tag"
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '2px solid #e1e8ed' }}
                            />
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-small"
                                onClick={handleAddTag}
                            >
                                Add
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="tags-container">
                                {tags.map((tag, idx) => (
                                    <span key={idx} className="tag">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {card ? 'Update Card' : 'Create Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Study Mode Component
function StudyMode({ deck, onExit }) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studiedCards, setStudiedCards] = useState(0);

    const currentCard = deck.cards[currentCardIndex];
    const progress = ((studiedCards / deck.cards.length) * 100).toFixed(0);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (!isFlipped) {
            setStudiedCards(studiedCards + 1);
        }
        
        if (currentCardIndex < deck.cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
        } else {
            alert('Congratulations! You\'ve completed this deck!');
            onExit();
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
        }
    };

    return (
        <div className="study-container">
            <div className="study-header">
                <h1>{deck.name}</h1>
                <p>Study Mode</p>
            </div>

            <div className="study-progress">
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="progress-text">
                    {studiedCards} / {deck.cards.length}
                </div>
            </div>

            <div className="flashcard-container">
                <div 
                    className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                    onClick={handleFlip}
                >
                    <div className="card-side-indicator">
                        {isFlipped ? 'BACK' : 'FRONT'}
                    </div>
                    
                    {!isFlipped ? (
                        <>
                            <h2>Question</h2>
                            <p>{currentCard.front}</p>
                        </>
                    ) : (
                        <>
                            <h2>Answer</h2>
                            <p>{currentCard.back}</p>
                        </>
                    )}
                    
                    {currentCard.image && (
                        <img src={currentCard.image} alt="Card visual" />
                    )}
                    
                    {currentCard.tags && currentCard.tags.length > 0 && (
                        <div className="card-tags">
                            <div className="tags-container">
                                {currentCard.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="study-actions">
                <button 
                    className="btn btn-secondary"
                    onClick={handlePrevious}
                    disabled={currentCardIndex === 0}
                >
                    ← Previous
                </button>
                <button 
                    className="btn btn-secondary"
                    onClick={handleFlip}
                >
                    {isFlipped ? 'Show Front' : 'Show Answer'}
                </button>
                <button 
                    className="btn btn-primary"
                    onClick={handleNext}
                >
                    {currentCardIndex === deck.cards.length - 1 ? 'Finish' : 'Next →'}
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button className="btn btn-danger btn-small" onClick={onExit}>
                    Exit Study Mode
                </button>
            </div>
        </div>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
