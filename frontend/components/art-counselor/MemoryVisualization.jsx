import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Filter, Calendar, Heart, MessageCircle, Palette, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';

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
    if (memories.length > 0 && viewMode === 'network') {
      renderNetworkVisualization();
    } else if (memories.length > 0 && viewMode === 'heatmap') {
      renderEmotionHeatmap();
    }
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
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    svg.attr("width", width).attr("height", height);

    // Group memories by session and theme
    const sessions = d3.group(memories, d => d.session_id);
    const themes = Array.from(new Set(memories.map(m => m.therapeutic_theme).filter(Boolean)));

    // Create nodes and links
    const nodes = [];
    const links = [];

    // Add theme nodes
    themes.forEach((theme, i) => {
      nodes.push({
        id: `theme-${theme}`,
        type: 'theme',
        name: theme,
        color: getThemeColor(theme),
        x: (width / themes.length) * i + 50,
        y: height / 2
      });
    });

    // Add memory nodes and links
    sessions.forEach((sessionMemories, sessionId) => {
      sessionMemories.forEach((memory, i) => {
        nodes.push({
          id: memory.id,
          type: 'memory',
          data: memory,
          name: memory.content.substring(0, 50) + '...',
          theme: memory.therapeutic_theme,
          color: getThemeColor(memory.therapeutic_theme)
        });

        // Link to theme
        if (memory.therapeutic_theme) {
          links.push({
            source: memory.id,
            target: `theme-${memory.therapeutic_theme}`,
            strength: memory.memory_importance || 0.5
          });
        }

        // Link to previous memory in session
        if (i > 0) {
          links.push({
            source: sessionMemories[i - 1].id,
            target: memory.id,
            strength: 0.3
          });
        }
      });
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).strength(d => d.strength))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.strength * 5));

    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.type === 'theme' ? 15 : 8)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (d.type === 'memory') {
          setSelectedMemory(d.data);
          onMemorySelect?.(d.data);
        }
      });

    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes.filter(d => d.type === 'theme'))
      .enter().append("text")
      .text(d => d.name.replace('_', ' '))
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .attr("dy", 25);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  };

  const renderEmotionHeatmap = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 50, right: 100, bottom: 50, left: 100 };

    svg.attr("width", width).attr("height", height);

    // Group memories by date and emotion
    const emotionsByDate = d3.rollup(
      memories.filter(m => m.emotion_detected),
      v => v.length,
      d => d3.timeDay(new Date(d.created_at)),
      d => {
        const emotions = Object.keys(d.emotion_detected.primary_emotions || {});
        return emotions[0] || 'neutral';
      }
    );

    const dates = Array.from(emotionsByDate.keys()).sort();
    const emotions = Array.from(new Set(
      Array.from(emotionsByDate.values())
        .flatMap(dateMap => Array.from(dateMap.keys()))
    ));

    if (dates.length === 0 || emotions.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("감정 데이터가 충분하지 않습니다")
        .style("font-size", "14px")
        .style("fill", "#666");
      return;
    }

    const xScale = d3.scaleBand()
      .domain(dates.map(d => d.toISOString().split('T')[0]))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(emotions)
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(Array.from(emotionsByDate.values()).flatMap(dateMap => Array.from(dateMap.values())))]);

    // Add rectangles
    dates.forEach(date => {
      emotions.forEach(emotion => {
        const count = emotionsByDate.get(date)?.get(emotion) || 0;

        svg.append("rect")
          .attr("x", xScale(date.toISOString().split('T')[0]))
          .attr("y", yScale(emotion))
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", colorScale(count))
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("cursor", "pointer")
          .append("title")
          .text(`${date.toISOString().split('T')[0]}, ${emotion}: ${count}회`);
      });
    });

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("날짜")
      .style("font-size", "12px");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("감정")
      .style("font-size", "12px");
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
                <svg ref={svgRef}></svg>
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