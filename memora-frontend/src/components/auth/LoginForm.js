import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api';

import ForgotPassword from './ForgotPassword';

export default function LoginForm({ onLoginSuccess }) {
    // const [user, setUser] = useState(null);
    // const [currentView, setCurrentView] = useState('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);


    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 9) {
        errors.push("Password must be at least 9 characters");
        }
        if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
        }
        if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
        }
        
        return errors;
    };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting login...');
      const result = await api.login(email, password);
      
      console.log('Login successful!', result);

    //   setUser(result.user);
    //   setCurrentView('dashboard');
     // Call the parent callback with user data
     onLoginSuccess(result.user);
      
      setEmail('');
      setPassword('');
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

  // Validate password first
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    setError(passwordErrors.join(". "));
    return; // Stop here, don't send to backend
  }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting registration...');
      const result = await api.register(email, password);
      
      console.log('✅ Registration successful!', result);

    //   setUser(result.user);
    //   setCurrentView('dashboard');
      // Call the parent callback with user data
      onLoginSuccess(result.user);
      
      setEmail('');
      setPassword('');
      
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    // Add this before your return statement
    if (showForgotPassword) {
      return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Memora</h1>
            </div>
            <h2 className="text-xl font-semibold text-center mb-6">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
            </div>
            )}
            <div className="space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </div>
            {passwordFocused && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <p className="font-semibold mb-1">Password requirements:</p>
                <ul className="space-y-1">
                    <li className={password.length >= 9 ? "text-green-600" : "text-gray-600"}>
                    ✓ At least 9 characters
                    </li>
                    <li className={/\d/.test(password) ? "text-green-600" : "text-gray-600"}>
                    ✓ Contains a number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-gray-600"}>
                    ✓ Contains a special character (!@#$%^&*)
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-600"}>
                    ✓ Contains an uppercase letter
                    </li>
                    <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-600"}>
                    ✓ Contains a lowercase letter
                    </li>
                </ul>
                </div>
            )}
            <button
                onClick={isRegistering ? handleRegister : handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-indigo-600 hover:underline"
            >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
            </div>
        </div>
        </div>
    );

}