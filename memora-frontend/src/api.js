// This file handles all communication between React and FastAPI
const API_BASE_URL = 'http://localhost:8000';

// Store the JWT token in memory
let authToken = null;

// Function to save the token
export const setAuthToken = (token) => {
  authToken = token;
  console.log('Token saved:', token ? 'Token exists' : 'No token');
};

// Function to get the token
export const getAuthToken = () => {
  return authToken;
};

// Function to clear the token (for logout)
export const clearAuthToken = () => {
  authToken = null;
  console.log('Token cleared');
};

// Generic function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if it exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  console.log(`Making request to: ${url}`);
  console.log('Request data:', options.body);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    // If unauthorized, clear token
    if (response.status === 401) {
      clearAuthToken();
      throw new Error('Session expired - please login again');
    }

    // If response is not ok, throw error
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || 'Request failed');
    }

    // Parse and return the response
    const data = await response.json();
    console.log('Response data:', data);
    return data;

  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ==========================================
// AUTHENTICATION API FUNCTIONS
// ==========================================

/**
 * Register a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Response with user data and token
 */
export const register = async (email, password) => {
  const response = await apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Save the token
  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Login an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} - Response with user data and token
 */
export const login = async (email, password) => {
  const response = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Save the token
  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

/**
 * Logout (just clears the token)
 */
export const logout = () => {
  clearAuthToken();
};

// ==========================================
// FLASHCARD SETS API FUNCTIONS
// ==========================================

/**
 * Get all flashcard sets for the logged-in user
 * @returns {Promise} - Array of flashcard sets
 */
export const getSets = async () => {
  return await apiCall('/api/sets', {
    method: 'GET',
  });
};

/**
 * Create a new flashcard set
 * @param {string} title - Set title
 * @param {string} description - Set description
 * @returns {Promise} - Created flashcard set
 */
export const createSet = async (title, description) => {
  return await apiCall('/api/sets', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
};

/**
 * Delete a flashcard set
 * @param {number} setId - ID of the set to delete
 * @returns {Promise} - Success response
 */
export const deleteSet = async (setId) => {
  return await apiCall(`/api/sets/${setId}`, {
    method: 'DELETE',
  });
};

// ==========================================
// FLASHCARDS API FUNCTIONS
// ==========================================

/**
 * Get all cards in a set
 * @param {number} setId - ID of the flashcard set
 * @returns {Promise} - Array of flashcards
 */
export const getCards = async (setId) => {
  return await apiCall(`/api/sets/${setId}/cards`, {
    method: 'GET',
  });
};

/**
 * Create a new flashcard
 * @param {number} setId - ID of the set to add card to
 * @param {object} cardData - Card data (frontText, backText, category, etc.)
 * @returns {Promise} - Created flashcard
 */
export const createCard = async (setId, cardData) => {
  return await apiCall(`/api/sets/${setId}/cards`, {
    method: 'POST',
    body: JSON.stringify(cardData),
  });
};

/**
 * Update a flashcard
 * @param {number} cardId - ID of the card to update
 * @param {object} cardData - Updated card data
 * @returns {Promise} - Updated flashcard
 */
export const updateCard = async (cardId, cardData) => {
  return await apiCall(`/api/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(cardData),
  });
};

/**
 * Delete a flashcard
 * @param {number} cardId - ID of the card to delete
 * @returns {Promise} - Success response
 */
export const deleteCard = async (cardId) => {
  return await apiCall(`/api/cards/${cardId}`, {
    method: 'DELETE',
  });
};

// ==========================================
// PROGRESS API FUNCTIONS
// ==========================================

/**
 * Get progress for a flashcard set
 * @param {number} setId - ID of the flashcard set
 * @returns {Promise} - Progress data (mastered, total, percentage)
 */
export const getProgress = async (setId) => {
  return await apiCall(`/api/progress/${setId}`, {
    method: 'GET',
  });
};

/**
 * Update progress for a specific card
 * @param {number} cardId - ID of the card
 * @param {boolean} isMastered - Whether the card is mastered
 * @returns {Promise} - Success response
 */
export const updateProgress = async (cardId, isMastered) => {
  return await apiCall(`/api/progress/card/${cardId}`, {
    method: 'POST',
    body: JSON.stringify({ is_mastered: isMastered }),
  });
};

// ==========================================
// CARD LINKS API FUNCTIONS (for Whiteboard Mode)
// ==========================================

/**
 * Get all links for a specific card
 * @param {number} cardId - ID of the card
 * @returns {Promise} - Array of links
 */
export const getCardLinks = async (cardId) => {
  return await apiCall(`/api/cards/${cardId}/links`, {
    method: 'GET',
  });
};

/**
 * Create a link between two cards
 * @param {number} fromCardId - ID of the source card
 * @param {number} toCardId - ID of the target card
 * @returns {Promise} - Created link
 */
export const createCardLink = async (fromCardId, toCardId) => {
  return await apiCall(`/api/cards/${fromCardId}/links`, {
    method: 'POST',
    body: JSON.stringify({ to_card_id: toCardId }),
  });
};

/**
 * Delete a card link
 * @param {number} linkId - ID of the link to delete
 * @returns {Promise} - Success response
 */
export const deleteCardLink = async (linkId) => {
  return await apiCall(`/api/links/${linkId}`, {
    method: 'DELETE',
  });
};