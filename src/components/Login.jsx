import { useState } from 'react'

function Login({ onLogin, onSwitchToRegister, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate login - in real app would validate against backend
    if (email && password) {
      onLogin({ email, name: email.split('@')[0] })
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to Memora</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={onForgotPassword} className="link-button">
          Forgot Password?
        </button>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="link-button">
            Register
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
