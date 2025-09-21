import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Filter, Calendar, Heart, MessageCircle, Palette, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoryVisualization = ({ userId, onMemorySelect }) => {
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, network, heatmap
  const [isLoading, setIsLoading] = useState(true);

  const svgRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    loadMemories();
  }, [userId]);

  useEffect(() => {
    // D3 visualizations disabled for now
    // Can be implemented later with d3 dependency
  }, [memories, viewMode]);

  const loadMemories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/art-counselor/memory?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMemories(data.data);
      }
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMemories = async (query) => {
    if (!query.trim()) {
      loadMemories();
      return;
    }

    try {
      const response = await fetch('/api/art-counselor/memory/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query, limit: 50 })
      });

      const data = await response.json();
      if (data.success) {
        setMemories(data.data);
      }
    } catch (error) {
      console.error('Failed to search memories:', error);
    }
  };

  const filterMemories = () => {
    let filtered = memories;

    if (selectedTheme !== 'all') {
      filtered = filtered.filter(memory => memory.therapeutic_theme === selectedTheme);
    }

    return filtered;
  };

  const getThemeColor = (theme) => {
    const colors = {
      'anxiety_management': '#ef4444',
      'grief_processing': '#3b82f6',
      'joy_celebration': '#eab308',
      'anger_processing': '#dc2626',
      'general_support': '#6b7280',
      'crisis_support': '#b91c1c',
      'emotional_validation': '#8b5cf6',
      'art_therapy_guidance': '#10b981',
      'reflection_encouragement': '#06b6d4'
    };
    return colors[theme] || '#6b7280';
  };

  const renderNetworkVisualization = () => {
    // Network visualization placeholder
    // Requires d3 library to be installed
    console.log('Network visualization not available - d3 dependency missing');
  };

  const renderEmotionHeatmap = () => {
    // Emotion heatmap placeholder
    // Requires d3 library to be installed
    console.log('Emotion heatmap not available - d3 dependency missing');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMemories = filterMemories();
  const themes = Array.from(new Set(memories.map(m => m.therapeutic_theme).filter(Boolean)));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">치료 기억 시각화</h2>
            <p className="text-blue-100">감정과 상담의 여정을 한눈에 보세요</p>
          </div>
          <Brain className="w-6 h-6" />
        </div>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2 || e.target.value.length === 0) {
                    searchMemories(e.target.value);
                  }
                }}
                placeholder="기억 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Theme Filter */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 테마</option>
            {themes.map(theme => (
              <option key={theme} value={theme}>
                {theme.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { mode: 'timeline', icon: Calendar, label: '시간순' },
              { mode: 'network', icon: Brain, label: '네트워크' },
              { mode: 'heatmap', icon: TrendingUp, label: '히트맵' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">기억을 불러오는 중...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visualization */}
            {(viewMode === 'network' || viewMode === 'heatmap') && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center p-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {viewMode === 'network' ? '네트워크 시각화' : '감정 히트맵'} 기능은 현재 개발 중입니다.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    시간순 보기를 이용해 주세요.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  시간순 기억 ({filteredMemories.length}개)
                </h3>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {filteredMemories.map((memory, index) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedMemory?.id === memory.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedMemory(memory);
                          onMemorySelect?.(memory);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {memory.message_type === 'user' ? (
                                <MessageCircle className="w-4 h-4 text-blue-500" />
                              ) : memory.message_type === 'counselor' ? (
                                <Brain className="w-4 h-4 text-purple-500" />
                              ) : (
                                <Palette className="w-4 h-4 text-green-500" />
                              )}

                              <span className="text-sm font-medium text-gray-900">
                                {memory.message_type === 'user' ? '사용자' :
                                 memory.message_type === 'counselor' ? 'MIYU' : '시스템'}
                              </span>

                              {memory.therapeutic_theme && (
                                <span
                                  className="px-2 py-1 rounded-full text-xs text-white"
                                  style={{ backgroundColor: getThemeColor(memory.therapeutic_theme) }}
                                >
                                  {memory.therapeutic_theme.replace('_', ' ')}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-700 text-sm line-clamp-2">
                              {memory.content}
                            </p>

                            {memory.emotion_detected && (
                              <div className="mt-2 flex items-center space-x-2">
                                <Heart className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-gray-500">
                                  감정 감지됨
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {formatDate(memory.created_at)}
                            </div>
                            {memory.memory_importance && (
                              <div className="mt-1">
                                <div className="flex space-x-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < memory.memory_importance * 5
                                          ? 'bg-yellow-400'
                                          : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {filteredMemories.length === 0 && !isLoading && (
              <div className="text-center p-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? '검색 결과가 없습니다.' : '아직 기록된 기억이 없습니다.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryVisualization;