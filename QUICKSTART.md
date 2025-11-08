# Memora - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Open the App
```bash
# Navigate to the folder
cd memora

# Start a local server (pick one):
python -m http.server 8000
# OR
python3 -m http.server 8000
# OR just double-click index.html
```

### Step 2: Create Your First Deck
1. Enter any email to "login" (no real authentication yet)
2. Click "Create New Deck"
3. Give it a name like "Biology 101"

### Step 3: Add Flashcards
1. Click "View" on your deck
2. Click "Add Card"
3. Enter a question on the front
4. Switch to back tab and enter the answer
5. Optional: Add images and tags
6. Click "Create Card"

### Step 4: Study!
1. Click "Study Now"
2. Click cards to flip them
3. Use navigation buttons to move through your deck
4. Track your progress with the progress bar

## ✨ Features at a Glance

- ✅ User registration and login UI
- ✅ Password reset flow
- ✅ Create/edit/delete flashcard decks
- ✅ Add text and images to cards
- ✅ Tag system for organization
- ✅ Study mode with flip animation
- ✅ Progress tracking
- ✅ Responsive design
- ✅ LocalStorage persistence

## 🎨 Customization

Want to change colors? Edit `styles.css` line 9:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📦 No Dependencies!

- No npm install needed
- No build process
- No complicated setup
- Just pure HTML, CSS, and React via CDN

## 🔧 Troubleshooting

**Can't see the app?**
- Make sure you're running a local server
- Check that all files are in the same folder

**Data not saving?**
- Enable LocalStorage in your browser
- Don't use incognito/private mode

**Need help?**
- Check the full README.md
- Open browser DevTools console for errors

---

That's it! You're ready to start creating flashcards with Memora! 🎓
