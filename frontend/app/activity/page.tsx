'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Filter, Search, TrendingUp, Eye, Heart, Bookmark, Trophy, Clock, ChevronDown } from 'lucide-react';
import { useRecentActivities, useActivityStats } from '@/hooks/useActivityTracker';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ActivityFilter = 'all' | 'view_artwork' | 'save_artwork' | 'view_exhibition' | 'save_exhibition' | 'create_collection' | 'complete_quiz';
type TimeFilter = 'all' | 'today' | 'week' | 'month';

export default function ActivityPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debug user authentication
  console.log('Activity Page - User state:', {
    user: !!user,
    userId: user?.id,
    loading,
    email: user?.auth?.email
  });

  // Fetch activities and stats
  const { activities, isLoading: activitiesLoading, refresh } = useRecentActivities(100);
  const { stats, isLoading: statsLoading } = useActivityStats();

  // Activity type labels and colors
  const activityTypes = {
    view_artwork: { label: '작품 감상', color: 'bg-purple-500/20 text-purple-300', icon: '👁️' },
    save_artwork: { label: '작품 저장', color: 'bg-blue-500/20 text-blue-300', icon: '💙' },
    like_artwork: { label: '작품 좋아요', color: 'bg-red-500/20 text-red-300', icon: '❤️' },
    view_exhibition: { label: '전시 조회', color: 'bg-green-500/20 text-green-300', icon: '🏛️' },
    save_exhibition: { label: '전시 저장', color: 'bg-yellow-500/20 text-yellow-300', icon: '📌' },
    record_exhibition: { label: '전시 기록', color: 'bg-indigo-500/20 text-indigo-300', icon: '✍️' },
    create_collection: { label: '컬렉션 생성', color: 'bg-pink-500/20 text-pink-300', icon: '📁' },
    complete_quiz: { label: '퀴즈 완료', color: 'bg-orange-500/20 text-orange-300', icon: '🎯' },
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    let filtered = [...activities];

    // Filter by activity type
    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter);
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeFilter) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(activity => 
        new Date(activity.createdAt) >= cutoff
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activities, activityFilter, timeFilter, searchQuery]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: typeof filteredActivities } = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-slate-300">활동 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">로그인이 필요합니다</h1>
          <p className="text-gray-400 mb-4">활동 내역을 보려면 로그인해주세요</p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/dashboard')} className="bg-purple-600 hover:bg-purple-700 mr-2">
              대시보드로 돌아가기
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-600 text-slate-300">
              페이지 새로고침
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-white truncate">나의 활동</h1>
                <p className="text-xs md:text-sm text-slate-400">
                  총 {filteredActivities.length}개의 활동
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-700 text-slate-300 ml-2 flex-shrink-0"
            >
              <Filter className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">필터</span>
              <ChevronDown className={`w-4 h-4 md:ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-400">총 활동</p>
                <p className="text-base md:text-lg font-semibold text-white">{stats?.total || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-400">작품 감상</p>
                <p className="text-base md:text-lg font-semibold text-white">{stats?.byType?.view_artwork || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Bookmark className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-400">저장</p>
                <p className="text-base md:text-lg font-semibold text-white">
                  {(stats?.byType?.save_artwork || 0) + (stats?.byType?.save_exhibition || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-400">퀴즈</p>
                <p className="text-base md:text-lg font-semibold text-white">{stats?.byType?.complete_quiz || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">활동 유형</label>
                    <Select value={activityFilter} onValueChange={(value: ActivityFilter) => setActivityFilter(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 활동</SelectItem>
                        {Object.entries(activityTypes).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">기간</label>
                    <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 기간</SelectItem>
                        <SelectItem value="today">오늘</SelectItem>
                        <SelectItem value="week">최근 1주일</SelectItem>
                        <SelectItem value="month">최근 1개월</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">검색</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="활동 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activities List */}
        <div className="space-y-6">
          {activitiesLoading ? (
            // Loading skeleton
            [1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-2 w-24"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : Object.keys(groupedActivities).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">활동 내역이 없습니다</h3>
              <p className="text-slate-500 mb-4">갤러리를 둘러보며 첫 활동을 시작해보세요!</p>
              <Button 
                onClick={() => router.push('/gallery')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                갤러리 둘러보기
              </Button>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-medium text-white">{date}</h3>
                  <p className="text-sm text-slate-400">{dayActivities.length}개의 활동</p>
                </div>
                <div className="divide-y divide-slate-700">
                  {dayActivities.map((activity, index) => {
                    const activityType = activityTypes[activity.type as keyof typeof activityTypes];
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs md:text-sm">{activity.icon || activityType?.icon || '📍'}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm md:text-base text-white font-medium line-clamp-1">
                                  {activity.title || '활동'}
                                </h4>
                                {activity.subtitle && (
                                  <p className="text-xs md:text-sm text-slate-400 line-clamp-1">{activity.subtitle}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {activityType && (
                                  <Badge className={`${activityType.color} border-none text-xs hidden md:inline-flex`}>
                                    {activityType.label}
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500">
                                  {activity.formattedTime || '방금 전'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Mobile badge */}
                            {activityType && (
                              <Badge className={`${activityType.color} border-none text-xs mt-1 inline-flex md:hidden`}>
                                {activityType.label}
                              </Badge>
                            )}
                          </div>
                          
                          {activity.image && (
                            <img 
                              src={activity.image} 
                              alt=""
                              className="w-10 h-10 md:w-12 md:h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}