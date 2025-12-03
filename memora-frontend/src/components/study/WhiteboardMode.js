import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Grid, List, Layout, BarChart3, Edit2, Trash2, Link2, X, Save, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../../api'; 

export default function WhiteboardMode({ cards, onExit }) {

      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Whiteboard Mode</h2>
              <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <X className="w-4 h-4" /> Exit
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-screen-75 relative">
              {cards.map(card => (
                <div
                  key={card.card_id}
                  style={{ left: `${card.position_x}px`, top: `${card.position_y}px` }}
                  className="absolute bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 w-48 shadow cursor-move hover:shadow-xl transition"
                >
                  <p className="text-sm font-semibold text-gray-800">{card.front_text}</p>
                  {card.category && (
                    <span className="text-xs bg-yellow-200 px-2 py-1 rounded mt-2 inline-block">
                      {card.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  
}