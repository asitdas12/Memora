import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)
  const [decks, setDecks] = useState([])

  useEffect(() => {
    // Load saved data from localStorage
    const savedUser = localStorage.getItem('memoraUser')
    const savedDecks = localStorage.getItem('memoraDecks')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setCurrentView('dashboard')
    }
    
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks))
    } else {
      // Initialize with sample deck
      const sampleDeck = {
        id: Date.now(),
        name: 'Sample Deck',
        cards: [
          {
            id: 1,
            front: 'What is React?',
            back: 'A JavaScript library for building user interfaces',
            image: null,
            progress: 0
          },
          {
            id: 2,
            front: 'What is a Component?',
            back: 'A reusable piece of UI that can have its own state and logic',
            image: null,
            progress: 0
          }
        ]
      }
      setDecks([sampleDeck])
      localStorage.setItem('memoraDecks', JSON.stringify([sampleDeck]))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('memoraUser', JSON.stringify(userData))
    setCurrentView('dashboard')
  }

  const handleRegister = (userData) => {
    setUser(userData)
    localStorage.setItem('memoraUser', JSON.stringify(userData))
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('memoraUser')
    setCurrentView('login')
  }

  const updateDecks = (newDecks) => {
    setDecks(newDecks)
    localStorage.setItem('memoraDecks', JSON.stringify(newDecks))
  }

  return (
    <div className="app">
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      )}
      
      {currentView === 'register' && (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
      
      {currentView === 'forgot-password' && (
        <div className="auth-container">
          <div className="auth-card">
            <h2>Reset Password</h2>
            <p>Enter your email to receive password reset instructions</p>
            <input type="email" placeholder="Email" />
            <button>Send Reset Email</button>
            <button onClick={() => setCurrentView('login')} className="link-button">
              Back to Login
            </button>
          </div>
        </div>
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          decks={decks}
          updateDecks={updateDecks}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
