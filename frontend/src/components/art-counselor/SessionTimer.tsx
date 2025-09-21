'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Coffee } from 'lucide-react';

interface SessionTimerProps {
  maxMinutes: number;
  onTimeUp?: () => void;
  warningThreshold?: number; // Show warning when this many minutes remain
}

export function SessionTimer({
  maxMinutes,
  onTimeUp,
  warningThreshold = 5
}: SessionTimerProps) {
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActive, setIsActive] = useState(true);
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
  const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) % 60;
  const remainingMinutes = Math.max(0, maxMinutes - elapsedMinutes);
  const remainingSeconds = remainingMinutes === 0 ? 0 : 60 - elapsedSeconds;

  const isWarning = remainingMinutes <= warningThreshold && remainingMinutes > 0;
  const isTimeUp = remainingMinutes === 0 && remainingSeconds === 0;

  // Handle warnings and time up
  useEffect(() => {
    if (isWarning && !hasWarned) {
      setHasWarned(true);
      // Optional: Could show a notification here
    }

    if (isTimeUp && onTimeUp) {
      setIsActive(false);
      onTimeUp();
    }
  }, [isWarning, isTimeUp, hasWarned, onTimeUp]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalSeconds = maxMinutes * 60;
    const elapsedTotalSeconds = elapsedMinutes * 60 + elapsedSeconds;
    return Math.min((elapsedTotalSeconds / totalSeconds) * 100, 100);
  };

  const getColorScheme = () => {
    if (isTimeUp) return 'red';
    if (isWarning) return 'amber';
    return 'blue';
  };

  const colorScheme = getColorScheme();

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      progress: 'bg-red-500',
      icon: 'text-red-500'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      progress: 'bg-amber-500',
      icon: 'text-amber-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      progress: 'bg-blue-500',
      icon: 'text-blue-500'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${colors.bg} ${colors.border} border rounded-lg p-4 min-w-[200px]`}
    >
      <div className=\"flex items-center justify-between mb-2\">
        <div className=\"flex items-center\">
          {isTimeUp ? (
            <Coffee className={`w-4 h-4 ${colors.icon} mr-2`} />
          ) : isWarning ? (
            <AlertTriangle className={`w-4 h-4 ${colors.icon} mr-2`} />
          ) : (
            <Clock className={`w-4 h-4 ${colors.icon} mr-2`} />
          )}
          <span className={`text-sm font-medium ${colors.text}`}>
            Session Timer
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className=\"w-full bg-gray-200 rounded-full h-2 mb-3\">
        <motion.div
          className={`h-2 rounded-full ${colors.progress}`}
          initial={{ width: 0 }}
          animate={{ width: `${getProgressPercentage()}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className=\"flex items-center justify-between\">
        <div className={`text-sm ${colors.text}`}>
          {isTimeUp ? (
            <span className=\"font-medium\">Time for a break!</span>
          ) : (
            <>
              <span className=\"font-mono text-lg font-bold\">
                {formatTime(remainingMinutes, remainingSeconds)}
              </span>
              <span className=\"ml-1\">left</span>
            </>
          )}
        </div>

        <div className={`text-xs ${colors.text} opacity-75`}>
          Elapsed: {formatTime(elapsedMinutes, elapsedSeconds)}
        </div>
      </div>

      {/* Warning Messages */}
      {isWarning && !isTimeUp && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mt-3 text-xs text-amber-800 bg-amber-100 rounded px-2 py-1\"
        >
          Session ending soon. Please start wrapping up your conversation.
        </motion.div>
      )}

      {isTimeUp && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mt-3 text-xs text-red-800 bg-red-100 rounded px-2 py-1\"
        >
          Your 30-minute session has ended. Take a break for your wellbeing.
        </motion.div>
      )}

      {/* Wellbeing Tip */}
      {elapsedMinutes > 0 && elapsedMinutes % 10 === 0 && !isTimeUp && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mt-3 text-xs text-blue-800 bg-blue-100 rounded px-2 py-1\"
        >
          💡 Remember to take deep breaths and stay present.
        </motion.div>
      )}
    </motion.div>
  );
}