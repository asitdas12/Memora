# Memora - Flashcard Study App

A clean, minimal-dependency flashcard application built with React for students to create and study annotated flashcards.

## Features

### Authentication
- **User Registration** - Create a new account with name, email, and password
- **Login/Logout** - Sign in to access your flashcard decks (UI only, no backend authentication yet)
- **Password Reset** - Request password reset via email (UI flow complete)

### Flashcard Management
- **Create Decks** - Organize flashcards into themed collections
- **Create Cards** - Build flashcards with front/back content
- **Add Images** - Upload images to enhance your flashcards
- **Tag System** - Categorize cards with custom tags for better organization
- **Edit & Delete** - Modify or remove cards and decks as needed

### Study Mode
- **Flip Cards** - Click to reveal answers
- **Progress Tracking** - Visual progress bar shows completion status
- **Navigation** - Move forward and backward through your deck
- **Completion Tracking** - Get notified when you finish studying a deck

### Future Features (Placeholder)
- **Whiteboard Mode** - Mind-map style visualization with connected cards (UI framework ready)

## Technology Stack

- **React 18** - UI library (loaded via CDN)
- **Vanilla CSS** - Custom styling, no frameworks
- **LocalStorage** - Client-side data persistence
- **No build process** - Just open and start coding!

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional but recommended)

### Installation

1. **Clone or download** this repository to your local machine

2. **Open the project** in your preferred code editor

3. **Run a local server** (choose one):

   **Option A: Using Python 3**
   ```bash
   cd memora
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`

   **Option B: Using Node.js (http-server)**
   ```bash
   npm install -g http-server
   cd memora
   http-server
   ```
   Then open `http://localhost:8080`

   **Option C: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

   **Option D: Just open the file**
   - Simply double-click `index.html`
   - Note: Some browsers may restrict features when opening files directly

## Project Structure

```
memora/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.jsx            # React application code
└── README.md          # This file
```

## Usage Guide

### Creating Your First Deck

1. **Register/Login** - Create an account or use any email to login
2. **Click "Create New Deck"** - On the dashboard
3. **Enter deck details** - Name and description
4. **Add flashcards** - Click "Add Card" in your new deck

### Creating Flashcards

1. **Open a deck** from the dashboard
2. **Click "Add Card"**
3. **Enter front content** - Your question or prompt
4. **Switch to back tab** - Enter the answer
5. **Add image (optional)** - Upload a visual aid
6. **Add tags (optional)** - Categorize your card
7. **Click "Create Card"**

### Studying

1. **Click "Study Now"** on any deck with cards
2. **Read the question** (front of card)
3. **Click the card** or "Show Answer" to flip
4. **Navigate** using Previous/Next buttons
5. **Track progress** via the progress bar

### Managing Cards

- **Edit**: Click the ✏️ icon on any card
- **Delete**: Click the 🗑️ icon (with confirmation)
- **View tags**: All tags display at the bottom of cards

## Data Persistence

- All data is stored in browser LocalStorage
- Data persists between sessions
- Data is browser-specific (won't sync across browsers)
- Clear browser data = lose all flashcards

## Customization

### Changing Colors

Edit `styles.css` and modify the gradient colors:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your preference */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Adding Features

The app is structured with clear components in `app.jsx`:
- `LoginPage` - Authentication UI
- `Dashboard` - Main deck overview
- `DeckDetail` - Individual deck management
- `CardEditorModal` - Card creation/editing
- `StudyMode` - Study interface

## Development Tips

### Hot Reloading
If using Live Server or similar, changes to files will auto-refresh the browser.

### Debugging
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension for component inspection

### Adding New Features

1. **Identify the component** to modify in `app.jsx`
2. **Add state** if needed with `useState`
3. **Create UI** elements in the return statement
4. **Style** in `styles.css`
5. **Test** thoroughly

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design included

## Known Limitations

- No backend - all data is client-side only
- No real authentication - login is UI only
- No data synchronization across devices
- No cloud backup
- LocalStorage has size limits (~5-10MB typically)

## Future Enhancements

- Backend integration with real authentication
- Cloud storage and sync
- Spaced repetition algorithm
- Whiteboard/mind-map mode implementation
- Export/import deck functionality
- Collaborative deck sharing
- Mobile app version
- Advanced statistics and analytics

## Troubleshooting

### Cards not saving
- Check browser console for errors
- Ensure LocalStorage is enabled
- Try a different browser

### Images not loading
- Check file size (keep under 1MB for best performance)
- Ensure image format is supported (jpg, png, gif, webp)
- Check browser console for errors

### Styling issues
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check CSS file is loading (DevTools Network tab)

## Contributing

This is a base project designed for easy modification. Feel free to:
- Add new features
- Improve styling
- Optimize performance
- Fix bugs

## License

Free to use and modify for personal or educational purposes.

## Support

For issues or questions:
1. Check browser console for errors
2. Review this README
3. Inspect the code - it's well-commented!

---

**Happy Studying! 📚**
