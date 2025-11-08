# Memora - Architecture & Component Guide

## 📁 File Structure

```
memora/
├── index.html          # Entry point, loads React and Babel
├── styles.css          # All styling (no framework)
├── app.jsx            # All React components and logic
├── README.md          # Full documentation
├── QUICKSTART.md      # Quick start guide
└── ARCHITECTURE.md    # This file
```

## 🏗️ Component Hierarchy

```
App (Root)
│
├── Authentication Flow (when not logged in)
│   ├── LoginPage
│   ├── RegisterPage
│   └── ForgotPasswordPage
│
└── MainApp (when logged in)
    ├── Navbar
    │   └── User avatar & logout
    │
    └── Main Content (conditional rendering)
        ├── Dashboard
        │   ├── Stats Grid
        │   ├── Decks Grid
        │   │   └── Deck Cards
        │   └── CreateDeckModal
        │
        ├── DeckDetail
        │   ├── Card Grid
        │   │   └── Card Items
        │   └── CardEditorModal
        │
        └── StudyMode
            ├── Progress Bar
            ├── Flashcard Display
            └── Navigation Controls
```

## 🧩 Component Breakdown

### App Component
**Purpose**: Root component, handles authentication state
**State**: 
- `currentUser` - Logged in user data
- `currentView` - Which auth page to show

**Key Functions**:
- `handleLogin()` - Sets user and switches to dashboard
- `handleLogout()` - Clears user and returns to login

---

### LoginPage Component
**Purpose**: User authentication UI
**Props**: `onLogin`, `onNavigate`
**State**: `email`, `password`
**Features**: Form validation, navigation to register/forgot password

---

### RegisterPage Component
**Purpose**: New user registration UI
**Props**: `onNavigate`
**State**: `name`, `email`, `password`, `confirmPassword`
**Features**: Form validation, password confirmation

---

### ForgotPasswordPage Component
**Purpose**: Password reset flow
**Props**: `onNavigate`
**State**: `email`, `submitted`
**Features**: Two-step flow (request → confirmation)

---

### MainApp Component
**Purpose**: Main application container after login
**Props**: `user`, `onLogout`
**State**:
- `decks` - Array of all flashcard decks
- `currentView` - dashboard | deck-detail
- `selectedDeck` - Currently viewing deck
- `studyMode` - Boolean for study mode

**Key Functions**:
- `handleCreateDeck()` - Adds new deck
- `handleDeleteDeck()` - Removes deck
- `handleViewDeck()` - Opens deck detail view
- `handleStudyDeck()` - Starts study mode
- `handleAddCard()` - Adds card to deck
- `handleEditCard()` - Updates card
- `handleDeleteCard()` - Removes card

**Data Persistence**: Uses localStorage for all deck/card data

---

### Navbar Component
**Purpose**: Top navigation bar
**Props**: `user`, `onLogout`
**Features**: Branding, user avatar, logout button

---

### Dashboard Component
**Purpose**: Main overview of all decks
**Props**: `decks`, `onCreateDeck`, `onDeleteDeck`, `onViewDeck`, `onStudyDeck`
**State**: `showCreateModal`
**Features**:
- Stats cards (total decks, cards, streak)
- Deck grid with actions
- Empty state for new users

---

### CreateDeckModal Component
**Purpose**: Modal for creating new decks
**Props**: `onClose`, `onSubmit`
**State**: `name`, `description`
**Features**: Form validation, modal overlay

---

### DeckDetail Component
**Purpose**: Shows all cards in a deck
**Props**: `deck`, `onBack`, `onAddCard`, `onEditCard`, `onDeleteCard`, `onStudy`
**State**: `showCardModal`, `editingCard`
**Features**:
- Card grid display
- Edit/delete actions per card
- Empty state for new decks

---

### CardEditorModal Component
**Purpose**: Create/edit flashcards
**Props**: `card`, `onClose`, `onSubmit`
**State**:
- `front` - Front content
- `back` - Back content
- `image` - Image data URL
- `tags` - Array of tags
- `tagInput` - Current tag being typed
- `currentSide` - front | back

**Features**:
- Tabbed interface for front/back
- Image upload with preview
- Tag management (add/remove)
- Supports editing existing cards

---

### StudyMode Component
**Purpose**: Interactive study interface
**Props**: `deck`, `onExit`
**State**:
- `currentCardIndex` - Which card is showing
- `isFlipped` - Is card showing answer
- `studiedCards` - Number of cards viewed

**Features**:
- Card flipping animation
- Progress tracking
- Navigation (previous/next)
- Completion notification

---

## 💾 Data Structure

### User Object
```javascript
{
    email: string,
    name: string
}
```

### Deck Object
```javascript
{
    id: string,
    name: string,
    description: string,
    cards: Card[],
    createdAt: ISO string
}
```

### Card Object
```javascript
{
    id: string,
    front: string,
    back: string,
    image: string | null,  // Base64 data URL
    tags: string[]
}
```

## 🔄 State Management

**Global State** (in MainApp):
- Managed with React useState
- Persisted to localStorage
- Key: `memora_decks`

**Authentication State** (in App):
- Managed with React useState
- Persisted to localStorage
- Key: `memora_user`

**Local State**:
- Each component manages its own form inputs
- Modal visibility states

## 🎨 Styling Architecture

### CSS Organization
1. **Reset & Base** - Universal styles
2. **Authentication** - Login/register pages
3. **Layout** - App container, navbar, main content
4. **Dashboard** - Stats, deck cards
5. **Modals** - Overlays and modal windows
6. **Study Mode** - Flashcard display and controls
7. **Utilities** - Buttons, forms, empty states
8. **Responsive** - Media queries for mobile

### Design System
**Colors**:
- Primary: `#667eea` to `#764ba2` (gradient)
- Secondary: `#e74c3c`
- Text: `#333`
- Gray: `#666`, `#999`
- Background: `#f7f9fc`

**Spacing**:
- Small: 8px, 12px, 16px
- Medium: 24px, 32px
- Large: 48px, 64px

**Border Radius**:
- Buttons: 8px
- Cards: 12px, 16px
- Tags: 16px (pill shape)

## 🚀 Adding New Features

### Example: Adding a "Favorite" Feature

1. **Update Card Data Structure**:
```javascript
{
    id: string,
    front: string,
    back: string,
    image: string | null,
    tags: string[],
    isFavorite: boolean  // NEW
}
```

2. **Add Toggle Function in MainApp**:
```javascript
const handleToggleFavorite = (deckId, cardId) => {
    setDecks(decks.map(d => {
        if (d.id === deckId) {
            return {
                ...d,
                cards: d.cards.map(c => 
                    c.id === cardId 
                        ? { ...c, isFavorite: !c.isFavorite }
                        : c
                )
            };
        }
        return d;
    }));
};
```

3. **Add UI in DeckDetail**:
```javascript
<button onClick={() => handleToggleFavorite(deck.id, card.id)}>
    {card.isFavorite ? '⭐' : '☆'}
</button>
```

4. **Add Styling in styles.css**:
```css
.favorite-btn {
    /* styles here */
}
```

## 🔍 Debugging Tips

### Common Issues

**Cards not saving**:
- Check localStorage in DevTools (Application tab)
- Verify JSON structure is valid

**Styling not applying**:
- Check CSS file is loaded (Network tab)
- Inspect element to see computed styles
- Check for typos in class names

**Component not updating**:
- Verify state is being set correctly
- Check that props are being passed down
- Use React DevTools to inspect component tree

### Useful Console Commands
```javascript
// View current decks
JSON.parse(localStorage.getItem('memora_decks'))

// Clear all data
localStorage.clear()

// Check current user
JSON.parse(localStorage.getItem('memora_user'))
```

## 📈 Future Architecture Improvements

### Recommended Enhancements

1. **State Management**: Consider Context API for large apps
2. **Routing**: Add React Router for URL-based navigation
3. **API Integration**: Replace localStorage with REST API
4. **TypeScript**: Add type safety for larger codebases
5. **Component Library**: Extract reusable components
6. **Testing**: Add unit tests with Jest/React Testing Library

### Scalability Considerations

**Current Limits**:
- LocalStorage: ~5-10MB
- No user separation (one user per browser)
- No sync across devices

**For Production**:
- Backend API (Node.js/Express, Django, etc.)
- Database (PostgreSQL, MongoDB)
- Authentication system (JWT, OAuth)
- Cloud storage for images
- Redis for caching

## 📚 Learning Resources

### Understanding the Code
- React Hooks: useState, useEffect
- Event handling in React
- Conditional rendering
- Array methods (map, filter, reduce)
- LocalStorage API
- FileReader API (for images)

### Next Steps
- Add React Router for better navigation
- Implement real backend authentication
- Add spaced repetition algorithm
- Build whiteboard/mind-map mode
- Add collaborative features

---

**Ready to build?** Start by modifying one component at a time and see your changes in action! 🎉
