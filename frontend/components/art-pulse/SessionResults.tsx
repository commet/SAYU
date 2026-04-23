'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArtPulseSession, SessionResults as Results, EMOTION_CONFIGS } from '../../../shared';
import { Trophy, Users, Heart, MessageCircle, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionResultsProps {
  session: ArtPulseSession;
  results: Results;
  onClose: () => void;
  className?: string;
}

export function SessionResults({ session, results, onClose, className }: SessionResultsProps) {
  const maxParticipants = Math.max(results.totalParticipants ?? 0, 1);
  const sayuDistribution = results.sayuDistribution ?? {};
  const topReflections = results.topReflections ?? [];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Art Pulse 결과
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">"{session.artwork.title}"</h3>
            <p className="text-sm text-muted-foreground">{session.artwork.artist}</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{results.totalParticipants}명 참여</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{results.totalReflections}개 사유</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Emotions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              주요 감정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.topEmotions.map((emotion, index) => {
              const config = EMOTION_CONFIGS[emotion.emotion];
              const percentage = (emotion.count / maxParticipants) * 100;
              
              return (
                <motion.div
                  key={emotion.emotion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-medium">{config.name}</span>
                      {index === 0 && (
                        <Badge className="bg-yellow-500 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          1위
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {emotion.count}명 ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ '--progress-background': config.color } as any}
                  />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* SAYU Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">참여자 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {results.emotionDiversity}
                </div>
                <div className="text-muted-foreground">감정 다양성</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {(results.averageEngagement ?? 0).toFixed(1)}
                </div>
                <div className="text-muted-foreground">평균 공감도</div>
              </div>
            </div>
            
            {Object.entries(sayuDistribution).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">성격 유형별 참여</h4>
                {Object.entries(sayuDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span>{type}</span>
                    <span>{count}명</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Reflections */}
      {topReflections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              최고의 사유
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topReflections.map((reflection, index) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border",
                  index === 0 && "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
                  index === 1 && "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200",
                  index === 2 && "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index < 3 && (
                      <Badge 
                        className={cn(
                          "text-white",
                          index === 0 && "bg-yellow-500",
                          index === 1 && "bg-gray-500",
                          index === 2 && "bg-orange-500"
                        )}
                      >
                        {index + 1}위
                      </Badge>
                    )}
                    <span className="font-medium">{reflection.username}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    {reflection.likes}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{reflection.reflection}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">감사합니다!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              오늘 Art Pulse에서 {results.totalParticipants}명의 참여자들과 함께 
              예술에 대한 다양한 생각을 나누었습니다. 
              사유와 공감을 통해 예술의 진정한 가치를 발견했습니다.
            </p>
          </motion.div>
          
          <div className="text-xs text-muted-foreground">
            다음 Art Pulse는 내일 오후 7시에 만나요! 🎨
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}