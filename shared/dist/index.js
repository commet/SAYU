"use strict";
/**
 * SAYU Shared Types and Utilities
 * Central export point for all shared types across frontend and backend
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERACTION_STYLE_OPTIONS = exports.VIEWING_PACE_OPTIONS = exports.TIME_SLOT_OPTIONS = exports.EMOTION_CONFIGS = exports.predefinedStyles = void 0;
// Re-export SAYU type definitions
__exportStar(require("./SAYUTypeDefinitions"), exports);
__exportStar(require("./easterEggDefinitions"), exports);
__exportStar(require("./artist-types"), exports);
exports.predefinedStyles = [
    {
        id: 'impressionist',
        name: 'Impressionist',
        description: 'Soft, dreamy brushstrokes with emphasis on light and color',
        examples: ['Monet', 'Renoir'],
        colorPalette: ['#E6D5B8', '#F0A500', '#4A7C7E'],
        characteristics: ['soft edges', 'light play', 'atmospheric']
    },
    {
        id: 'abstract',
        name: 'Abstract',
        description: 'Bold shapes and colors expressing emotions',
        examples: ['Kandinsky', 'Pollock'],
        colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        characteristics: ['geometric', 'expressive', 'non-representational']
    }
];
exports.EMOTION_CONFIGS = {
    joy: { color: '#FFD93D', label: 'Joy', icon: '😊', name: 'Joy', description: 'Feeling of happiness and delight' },
    sadness: { color: '#6C5CE7', label: 'Sadness', icon: '😢', name: 'Sadness', description: 'Feeling of sorrow or unhappiness' },
    anger: { color: '#FF6B6B', label: 'Anger', icon: '😠', name: 'Anger', description: 'Feeling of strong displeasure' },
    fear: { color: '#A8E6CF', label: 'Fear', icon: '😰', name: 'Fear', description: 'Feeling of anxiety or apprehension' },
    love: { color: '#FF8B94', label: 'Love', icon: '❤️', name: 'Love', description: 'Feeling of deep affection' },
    surprise: { color: '#4ECDC4', label: 'Surprise', icon: '😮', name: 'Surprise', description: 'Feeling of unexpected wonder' },
    calm: { color: '#95E1D3', label: 'Calm', icon: '😌', name: 'Calm', description: 'Feeling of peace and tranquility' },
    excitement: { color: '#F38181', label: 'Excitement', icon: '🤩', name: 'Excitement', description: 'Feeling of enthusiasm and energy' },
    wonder: { color: '#B794F4', label: 'Wonder', icon: '🤔', name: 'Wonder', description: 'Feeling of curiosity and amazement' },
    melancholy: { color: '#718096', label: 'Melancholy', icon: '😔', name: 'Melancholy', description: 'Feeling of pensive sadness' },
    contemplation: { color: '#4FD1C5', label: 'Contemplation', icon: '🧐', name: 'Contemplation', description: 'Deep reflective thought' },
    nostalgia: { color: '#F6AD55', label: 'Nostalgia', icon: '🥺', name: 'Nostalgia', description: 'Sentimental longing for the past' },
    awe: { color: '#FC8181', label: 'Awe', icon: '😲', name: 'Awe', description: 'Feeling of reverent wonder' },
    serenity: { color: '#9F7AEA', label: 'Serenity', icon: '😇', name: 'Serenity', description: 'State of being calm and peaceful' },
    passion: { color: '#F687B3', label: 'Passion', icon: '🔥', name: 'Passion', description: 'Intense enthusiasm or desire' },
    mystery: { color: '#667EEA', label: 'Mystery', icon: '🎭', name: 'Mystery', description: 'Feeling of intrigue and curiosity' },
    hope: { color: '#48BB78', label: 'Hope', icon: '🌟', name: 'Hope', description: 'Feeling of expectation and desire' }
};
// Constants
exports.TIME_SLOT_OPTIONS = [
    'morning',
    'afternoon',
    'evening'
];
exports.VIEWING_PACE_OPTIONS = [
    'slow',
    'moderate',
    'fast'
];
exports.INTERACTION_STYLE_OPTIONS = [
    'quiet',
    'discussion',
    'guided'
];
