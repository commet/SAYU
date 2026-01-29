#!/usr/bin/env node

// SAYU Production Server - Railway 배포용
// Full-featured backend server for production deployment

// Load environment variables first
require('dotenv').config();

console.log('🚀 Starting SAYU Production Server...');

// Full server 사용 (모든 기능 포함)
console.log('📍 Running Full Server mode');
require('./src/server.js');
