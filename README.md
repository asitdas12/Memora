# Memora - Flashcard Learning App

A minimal React-based flashcard application built with Vite, featuring no external CSS libraries for easy customization.

## Features

- **User Authentication**: Register, login, and password reset UI
- **Deck Management**: Create, edit, and delete flashcard decks
- **Card Creation**: Add text and images to flashcards
- **Study Mode**: Flip cards and track progress with difficulty ratings
- **Progress Tracking**: Visual progress bars for each deck
- **View Modes**: Toggle between card view and whiteboard view (whiteboard coming soon)
- **Local Storage**: All data persists in browser storage

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Structure

```
memora/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DeckList.jsx
│   │   ├── CardEditor.jsx
│   │   └── StudyMode.jsx
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## Usage

1. **Register/Login**: Create an account or login (authentication is simulated with localStorage)
2. **Create Deck**: Click "Create New Deck" and enter a name
3. **Add Cards**: Click "Edit" on a deck to add flashcards with questions and answers
4. **Study**: Click "Study" to review cards with flip animation
5. **Track Progress**: Mark cards as Easy/Medium/Hard to track your learning

## Technical Details

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Pure CSS (no frameworks)
- **Storage**: LocalStorage for data persistence
- **Features**: Card flip animations, progress tracking, image support

## Future Enhancements

- Whiteboard/mind map view for visual learning
- Backend integration for real authentication
- Spaced repetition algorithm
- Export/import deck functionality
- Collaborative study features

## Development

This is a minimal base project designed to be easily extended. The codebase uses:
- Functional React components with hooks
- Local state management
- CSS modules for component styling
- No external dependencies beyond React

Perfect for quick prototyping or as a starting point for a more complex application.
