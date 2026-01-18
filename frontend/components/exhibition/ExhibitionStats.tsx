'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area,
  ResponsiveContainer, Legend
} from 'recharts';

interface Insight {
  id: string;
  artwork: string;
  emotion: string;
  note: string;
  timestamp: Date;
  colorPalette: string[];
}

interface Exhibition {
  id: string;
  name: string;
  venue: string;
  date: Date;
  insights: Insight[];
}

interface ExhibitionStatsProps {
  exhibitions: Exhibition[];
}

const emotions = [
  { id: 'joy', emoji: '😊', name: '기쁨', color: '#FFD93D' },
  { id: 'awe', emoji: '😮', name: '경외', color: '#6B5B95' },
  { id: 'peace', emoji: '😌', name: '평온', color: '#88D8B0' },
  { id: 'curiosity', emoji: '🤔', name: '호기심', color: '#FF6F61' },
  { id: 'nostalgia', emoji: '🥺', name: '그리움', color: '#955251' },
  { id: 'inspiration', emoji: '✨', name: '영감', color: '#F7CAC9' },
  { id: 'melancholy', emoji: '😔', name: '우울', color: '#92A8D1' },
  { id: 'confusion', emoji: '😵', name: '혼란', color: '#B565A7' }
];

export default function ExhibitionStats({ exhibitions }: ExhibitionStatsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '3months' | '6months' | 'year'>('all');

  // Filter exhibitions by period
  const filteredExhibitions = exhibitions.filter(exhibition => {
    if (selectedPeriod === 'all') return true;

    const now = new Date();
    const exhibitionDate = new Date(exhibition.date);
    const monthsAgo = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsAgo));

    return exhibitionDate >= cutoffDate;
  });

  // Calculate statistics
  const totalInsights = filteredExhibitions.reduce((sum, ex) => sum + ex.insights.length, 0);
  const avgInsightsPerExhibition = filteredExhibitions.length > 0
    ? (totalInsights / filteredExhibitions.length).toFixed(1)
    : '0';

  // Emotion distribution data for Recharts
  const getEmotionDistribution = () => {
    const emotionCounts: Record<string, number> = {};

    filteredExhibitions.forEach(exhibition => {
      exhibition.insights.forEach(insight => {
        emotionCounts[insight.emotion] = (emotionCounts[insight.emotion] || 0) + 1;
      });
    });

    return emotions.map(e => ({
      name: e.name,
      value: emotionCounts[e.id] || 0,
      color: e.color
    })).filter(e => e.value > 0);
  };

  // Time distribution data for Recharts
  const getTimeDistribution = () => {
    const hourCounts = new Array(24).fill(0);

    filteredExhibitions.forEach(exhibition => {
      exhibition.insights.forEach(insight => {
        const hour = new Date(insight.timestamp).getHours();
        hourCounts[hour]++;
      });
    });

    return hourCounts.map((count, hour) => ({
      hour: `${hour}시`,
      count
    }));
  };

  // Monthly trend data for Recharts
  const getMonthlyTrend = () => {
    const monthlyData: Record<string, number> = {};

    filteredExhibitions.forEach(exhibition => {
      const monthKey = new Date(exhibition.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short'
      });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exhibition.insights.length;
    });

    return Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month, count }));
  };

  // Most emotional exhibitions
  const getMostEmotionalExhibitions = () => {
    return filteredExhibitions
      .map(ex => ({
        name: ex.name,
        insightCount: ex.insights.length,
        venue: ex.venue,
        date: ex.date
      }))
      .sort((a, b) => b.insightCount - a.insightCount)
      .slice(0, 5);
  };

  const emotionData = getEmotionDistribution();
  const timeData = getTimeDistribution();
  const trendData = getMonthlyTrend();

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex justify-center gap-4">
        {(['all', '3months', '6months', 'year'] as const).map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedPeriod === period
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {period === 'all' ? '전체' :
             period === '3months' ? '3개월' :
             period === '6months' ? '6개월' : '1년'}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {filteredExhibitions.length}
          </div>
          <div className="text-white/80">전시 관람</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {totalInsights}
          </div>
          <div className="text-white/80">총 인사이트</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {avgInsightsPerExhibition}
          </div>
          <div className="text-white/80">평균 인사이트</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {(() => {
              const uniqueVenues = new Set(filteredExhibitions.map(ex => ex.venue));
              return uniqueVenues.size;
            })()}
          </div>
          <div className="text-white/80">방문 장소</div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emotion Distribution - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">감정 분포</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'white', strokeWidth: 1 }}
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Time Distribution - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">시간대별 활동</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'white', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  interval={2}
                />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="rgba(147, 51, 234, 0.7)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Trend - Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-white mb-4">월별 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(147, 51, 234, 0.8)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgba(147, 51, 234, 0.1)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'white', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="rgba(147, 51, 234, 1)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Exhibitions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">가장 많은 감동을 준 전시</h3>
        <div className="space-y-3">
          {getMostEmotionalExhibitions().map((exhibition, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-lg p-4"
            >
              <div>
                <div className="font-semibold text-white">{exhibition.name}</div>
                <div className="text-sm text-white/60">
                  {exhibition.venue} • {new Date(exhibition.date).toLocaleDateString('ko-KR')}
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {exhibition.insightCount}
                <span className="text-sm font-normal text-white/60 ml-1">인사이트</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
