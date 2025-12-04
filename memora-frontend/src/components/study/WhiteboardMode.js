import React, { useState, useEffect, useRef } from 'react';
import { X, Link2, Trash2, CheckCircle } from 'lucide-react';
import * as api from '../../api'; 

export default function WhiteboardMode({ cards, setId, onExit, onCardsUpdated }) {
  const [editMode, setEditMode] = useState(true); // true = edit, false = quiz
  const [draggingCard, setDraggingCard] = useState(null);
  const [cardPositions, setCardPositions] = useState({});
  const [links, setLinks] = useState([]); // Arrows between cards
  const [selectedCardForLink, setSelectedCardForLink] = useState(null);
  const [userLinks, setUserLinks] = useState([]); // User's quiz answers
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const whiteboardRef = useRef(null);

  // Initialize card positions from database or set defaults
  useEffect(() => {
    const positions = {};
    cards.forEach((card, index) => {
      positions[card.card_id] = {
        x: card.position_x || 100 + (index % 4) * 250,
        y: card.position_y || 100 + Math.floor(index / 4) * 200
      };
    });
    setCardPositions(positions);
  }, [cards]);

  // Load existing links from backend
  useEffect(() => {
    const loadLinks = async () => {
      try {
        // Get links for all cards in this set
        const allLinks = [];
        for (const card of cards) {
          const response = await api.getCardLinks(card.card_id);
          if (response && response.length > 0) {
            allLinks.push(...response);
          }
        }
        setLinks(allLinks);
      } catch (error) {
        console.error('Failed to load links:', error);
      }
    };
    
    if (editMode) {
      loadLinks();
    }
  }, [cards, editMode]);

  // Handle card drag start
  const handleMouseDown = (e, cardId) => {
    if (!editMode) return; // Can't drag in quiz mode
    e.preventDefault();
    setDraggingCard(cardId);
  };

  // Handle card dragging
  const handleMouseMove = (e) => {
    if (!draggingCard || !whiteboardRef.current) return;

    const rect = whiteboardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100; // Offset for card width/2
    const y = e.clientY - rect.top - 75; // Offset for card height/2

    setCardPositions(prev => ({
      ...prev,
      [draggingCard]: { x: Math.max(0, x), y: Math.max(0, y) }
    }));
  };

  // Handle card drag end - save position to database
  const handleMouseUp = async () => {
    if (!draggingCard) return;

    const position = cardPositions[draggingCard];
    
    try {
      // Save position to backend
      await api.updateCard(draggingCard, {
        position_x: position.x,
        position_y: position.y
      });
      console.log('✅ Card position saved');
    } catch (error) {
      console.error('Failed to save card position:', error);
    }

    setDraggingCard(null);
  };

  // Handle card click for linking
  const handleCardClick = async (cardId) => {
    if (editMode) {
      // Edit mode: create permanent links
      if (!selectedCardForLink) {
        setSelectedCardForLink(cardId);
      } else {
        if (selectedCardForLink !== cardId) {
          // Create link
          try {
            const newLink = await api.createCardLink(selectedCardForLink, cardId);
            setLinks([...links, newLink]);
            console.log('✅ Link created');
          } catch (error) {
            console.error('Failed to create link:', error);
          }
        }
        setSelectedCardForLink(null);
      }
    } else {
      // Quiz mode: create user answer links
      if (!selectedCardForLink) {
        setSelectedCardForLink(cardId);
      } else {
        if (selectedCardForLink !== cardId) {
          const newUserLink = {
            from_card_id: selectedCardForLink,
            to_card_id: cardId
          };
          setUserLinks([...userLinks, newUserLink]);
        }
        setSelectedCardForLink(null);
      }
    }
  };

  // Delete a link
  const handleDeleteLink = async (linkId) => {
    try {
      await api.deleteCardLink(linkId);
      setLinks(links.filter(l => l.link_id !== linkId));
      console.log('✅ Link deleted');
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  // Get correct links based on order_number
  const getCorrectLinks = () => {
    const sortedCards = [...cards].sort((a, b) => {
      const orderA = a.order_number || 0;
      const orderB = b.order_number || 0;
      return orderA - orderB;
    });

    const correctLinks = [];
    for (let i = 0; i < sortedCards.length - 1; i++) {
      correctLinks.push({
        from_card_id: sortedCards[i].card_id,
        to_card_id: sortedCards[i + 1].card_id
      });
    }
    return correctLinks;
  };

  // Check quiz answers
  const handleCheckQuiz = () => {
    const correctLinks = getCorrectLinks();
    const total = correctLinks.length;
    let correct = 0;

    // Check each user link
    correctLinks.forEach(correctLink => {
      const matchingUserLink = userLinks.find(
        ul => ul.from_card_id === correctLink.from_card_id && 
              ul.to_card_id === correctLink.to_card_id
      );
      if (matchingUserLink) {
        correct++;
      }
    });

    setQuizScore({ correct, total });
    setQuizChecked(true);
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setUserLinks([]);
    setQuizChecked(false);
    setQuizScore({ correct: 0, total: 0 });
    setSelectedCardForLink(null);
  };

  // Toggle between edit and quiz mode
  const handleToggleMode = () => {
    setEditMode(!editMode);
    setSelectedCardForLink(null);
    if (!editMode) {
      // Switching back to edit mode - reset quiz
      handleResetQuiz();
    }
  };

  // Draw arrow between two cards
  const drawArrow = (fromCardId, toCardId, isUserLink = false, isCorrect = null) => {
    const fromPos = cardPositions[fromCardId];
    const toPos = cardPositions[toCardId];

    if (!fromPos || !toPos) return null;

    // Calculate center points of cards
    const fromX = fromPos.x + 100; // Card width/2
    const fromY = fromPos.y + 75;  // Card height/2
    const toX = toPos.x + 100;
    const toY = toPos.y + 75;

    // Calculate angle for arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;

    // Arrowhead points
    const arrowX1 = toX - arrowLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = toY - arrowLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = toX - arrowLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = toY - arrowLength * Math.sin(angle + Math.PI / 6);

    // Determine color
    let strokeColor = '#4F46E5'; // Indigo for edit mode
    if (!editMode) {
      if (quizChecked) {
        strokeColor = isCorrect ? '#10B981' : '#EF4444'; // Green or red
      } else {
        strokeColor = isUserLink ? '#8B5CF6' : 'transparent'; // Purple for user links
      }
    }

    return (
      <g key={`${fromCardId}-${toCardId}-${isUserLink}`}>
        {/* Main line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={strokeColor}
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
        {/* Arrowhead */}
        <polygon
          points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill={strokeColor}
        />
      </g>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-100 p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Whiteboard Mode</h2>
            <p className="text-sm text-gray-600 mt-1">
              {editMode 
                ? 'Click two cards to create a link. Drag cards to reposition.' 
                : 'Click two cards to draw arrows in the correct order'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm font-medium text-gray-700">
                {editMode ? 'Edit Mode' : 'Quiz Mode'}
              </span>
              <button
                onClick={handleToggleMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  !editMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    !editMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button 
              onClick={onExit} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>

        {/* Quiz Instructions */}
        {!editMode && !quizChecked && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Quiz Instructions</h3>
            <p className="text-sm text-blue-800">
              Click on cards in the correct order to create arrows. 
              The arrows should connect cards in sequence based on their order numbers (1→2→3→4).
              Click "Check Answers" when you're done!
            </p>
          </div>
        )}

        {/* Quiz Results */}
        {!editMode && quizChecked && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Quiz Results</h3>
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Try Again
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-indigo-600">
                  {quizScore.correct} / {quizScore.total}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {quizScore.total > 0 
                    ? Math.round((quizScore.correct / quizScore.total) * 100) 
                    : 0}% Correct
                </div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-indigo-600 h-4 rounded-full transition-all"
                    style={{ 
                      width: `${quizScore.total > 0 
                        ? (quizScore.correct / quizScore.total) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check Answers Button */}
        {!editMode && !quizChecked && userLinks.length > 0 && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleCheckQuiz}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Check Answers ({userLinks.length} links drawn)
            </button>
          </div>
        )}

        {/* Whiteboard Canvas */}
        <div 
          ref={whiteboardRef}
          className="bg-white rounded-xl shadow-lg p-8 relative"
          style={{ minHeight: '600px', position: 'relative' }}
        >
          {/* SVG for drawing arrows */}
          <svg 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {/* Draw existing links in edit mode */}
            {editMode && links.map((link, index) => 
              drawArrow(link.from_card_id, link.to_card_id, false)
            )}

            {/* Draw user links in quiz mode */}
            {!editMode && !quizChecked && userLinks.map((link, index) =>
              drawArrow(link.from_card_id, link.to_card_id, true)
            )}

            {/* Draw feedback in quiz mode after checking */}
            {!editMode && quizChecked && (() => {
              const correctLinks = getCorrectLinks();
              return correctLinks.map(correctLink => {
                const userHasLink = userLinks.find(
                  ul => ul.from_card_id === correctLink.from_card_id && 
                        ul.to_card_id === correctLink.to_card_id
                );
                return drawArrow(
                  correctLink.from_card_id, 
                  correctLink.to_card_id, 
                  false, 
                  !!userHasLink
                );
              });
            })()}
          </svg>

          {/* Cards */}
          {cards.map(card => {
            const position = cardPositions[card.card_id] || { x: 0, y: 0 };
            const isSelected = selectedCardForLink === card.card_id;

            return (
              <div
                key={card.card_id}
                onMouseDown={(e) => handleMouseDown(e, card.card_id)}
                onClick={() => handleCardClick(card.card_id)}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: '200px',
                  cursor: editMode ? 'move' : 'pointer'
                }}
                className={`bg-yellow-100 border-2 rounded-lg p-4 shadow transition hover:shadow-xl ${
                  isSelected 
                    ? 'border-indigo-500 border-4 shadow-2xl' 
                    : 'border-yellow-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800 flex-1">
                    {card.front_text}
                  </p>
                  {card.order_number && (
                    <div className="bg-indigo-100 text-indigo-600 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ml-2">
                      {card.order_number}
                    </div>
                  )}
                </div>
                
                {card.category && (
                  <span className="text-xs bg-yellow-200 px-2 py-1 rounded inline-block">
                    {card.category}
                  </span>
                )}

                {isSelected && (
                  <div className="mt-2 text-xs text-indigo-600 font-semibold">
                    Click another card to link →
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {cards.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-400 text-lg">No cards in this set</p>
            </div>
          )}
        </div>

        {/* Edit Mode: Show existing links */}
        {editMode && links.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Existing Links ({links.length})
            </h3>
            <div className="space-y-2">
              {links.map(link => {
                const fromCard = cards.find(c => c.card_id === link.from_card_id);
                const toCard = cards.find(c => c.card_id === link.to_card_id);
                
                return (
                  <div 
                    key={link.link_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{fromCard?.front_text || 'Unknown'}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{toCard?.front_text || 'Unknown'}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.link_id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}