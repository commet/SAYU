import React, { useState, useEffect, useRef } from 'react';
import { Heart, Brain, Save, Trash2, Eye, Mic, MicOff, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmotionalResponseRecorder = ({
  artworkId,
  artworkData,
  onResponseSaved,
  onClose,
  initialResponse = null
}) => {
  const [emotionalResponse, setEmotionalResponse] = useState(initialResponse?.emotional_response || {});
  const [responseIntensity, setResponseIntensity] = useState(initialResponse?.response_intensity || 0.5);
  const [personalMeaning, setPersonalMeaning] = useState(initialResponse?.personal_meaning || '');
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const emotionCategories = [
    {
      name: '긍정적 감정',
      emotions: [
        { key: 'joy', label: '기쁨', emoji: '😊', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { key: 'peace', label: '평온', emoji: '😌', color: 'bg-green-100 text-green-800 border-green-300' },
        { key: 'inspiration', label: '영감', emoji: '✨', color: 'bg-purple-100 text-purple-800 border-purple-300' },
        { key: 'wonder', label: '경이', emoji: '🤩', color: 'bg-pink-100 text-pink-800 border-pink-300' },
        { key: 'comfort', label: '위안', emoji: '🤗', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        { key: 'hope', label: '희망', emoji: '🌟', color: 'bg-blue-100 text-blue-800 border-blue-300' }
      ]
    },
    {
      name: '복합적 감정',
      emotions: [
        { key: 'nostalgia', label: '그리움', emoji: '🌅', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { key: 'contemplation', label: '사색', emoji: '🤔', color: 'bg-gray-100 text-gray-800 border-gray-300' },
        { key: 'melancholy', label: '우울', emoji: '🌧️', color: 'bg-slate-100 text-slate-800 border-slate-300' },
        { key: 'yearning', label: '갈망', emoji: '🌙', color: 'bg-violet-100 text-violet-800 border-violet-300' },
        { key: 'solemnity', label: '엄숙', emoji: '🏛️', color: 'bg-stone-100 text-stone-800 border-stone-300' },
        { key: 'mystery', label: '신비', emoji: '🔮', color: 'bg-purple-100 text-purple-800 border-purple-300' }
      ]
    },
    {
      name: '강한 감정',
      emotions: [
        { key: 'sadness', label: '슬픔', emoji: '😢', color: 'bg-blue-100 text-blue-800 border-blue-300' },
        { key: 'anxiety', label: '불안', emoji: '😰', color: 'bg-red-100 text-red-800 border-red-300' },
        { key: 'overwhelm', label: '압도감', emoji: '😵', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { key: 'confusion', label: '혼란', emoji: '😕', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { key: 'longing', label: '그리움', emoji: '💔', color: 'bg-pink-100 text-pink-800 border-pink-300' },
        { key: 'tension', label: '긴장', emoji: '😬', color: 'bg-red-100 text-red-800 border-red-300' }
      ]
    }
  ];

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('음성 녹음 권한이 필요합니다.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const playAudioRecording = () => {
    if (audioRecording && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const audioUrl = URL.createObjectURL(audioRecording);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);

        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    }
  };

  const deleteAudioRecording = () => {
    setAudioRecording(null);
    setIsPlaying(false);
    setRecordingDuration(0);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updateEmotionIntensity = (emotionKey, currentIntensity) => {
    let newIntensity;
    if (currentIntensity === 0) {
      newIntensity = 0.25;
    } else if (currentIntensity >= 1) {
      newIntensity = 0;
    } else {
      newIntensity = Math.min(currentIntensity + 0.25, 1);
    }

    setEmotionalResponse(prev => ({
      ...prev,
      [emotionKey]: newIntensity
    }));
  };

  const saveResponse = async () => {
    if (Object.keys(emotionalResponse).length === 0) {
      alert('하나 이상의 감정을 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('artworkId', artworkId);
      formData.append('emotionalResponse', JSON.stringify(emotionalResponse));
      formData.append('responseIntensity', responseIntensity.toString());
      formData.append('personalMeaning', personalMeaning);

      if (artworkData) {
        formData.append('artworkTitle', artworkData.title || '');
        formData.append('artworkArtist', artworkData.artist || '');
        formData.append('artworkYear', artworkData.year?.toString() || '');
      }

      if (audioRecording) {
        formData.append('voiceNote', audioRecording, 'emotional_response.wav');
      }

      const response = await fetch('/api/art-counselor/response', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onResponseSaved?.(data.data);
        onClose?.();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert('감정 응답 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasSelectedEmotions = Object.keys(emotionalResponse).length > 0;
  const selectedEmotionsCount = Object.values(emotionalResponse).filter(v => v > 0).length;

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">감정 응답 기록</h2>
            <p className="text-purple-100">작품을 보며 느낀 감정을 세밀하게 기록해보세요</p>
          </div>
          <Heart className="w-6 h-6" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Artwork Info */}
        {artworkData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">{artworkData.title}</h3>
            {artworkData.artist && (
              <p className="text-gray-600 text-sm mt-1">
                {artworkData.artist} {artworkData.year && `(${artworkData.year})`}
              </p>
            )}
          </div>
        )}

        {/* Emotion Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">느낀 감정 선택</h3>
            <span className="text-sm text-gray-500">
              {selectedEmotionsCount}개 선택됨
            </span>
          </div>

          <div className="space-y-6">
            {emotionCategories.map((category) => (
              <div key={category.name}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{category.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {category.emotions.map((emotion) => {
                    const intensity = emotionalResponse[emotion.key] || 0;
                    return (
                      <motion.button
                        key={emotion.key}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateEmotionIntensity(emotion.key, intensity)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          intensity > 0
                            ? emotion.color
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{emotion.emoji}</span>
                            <span className="text-sm font-medium">{emotion.label}</span>
                          </div>
                          {intensity > 0 && (
                            <div className="flex space-x-1">
                              {Array.from({ length: 4 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < intensity * 4 ? 'bg-current' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Intensity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전체적인 감정의 강도
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">약함</span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={responseIntensity}
                onChange={(e) => setResponseIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <span className="text-sm text-gray-500">강함</span>
            <span className="text-sm font-medium text-purple-600 min-w-[40px]">
              {Math.round(responseIntensity * 100)}%
            </span>
          </div>
        </div>

        {/* Voice Recording */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            음성 메모 (선택사항)
          </label>

          {!audioRecording ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!isRecording ? (
                <div>
                  <Mic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-3">음성으로 감정을 더 자세히 표현해보세요</p>
                  <button
                    onClick={startAudioRecording}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Mic className="w-4 h-4 inline mr-2" />
                    녹음 시작
                  </button>
                </div>
              ) : (
                <div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"
                  />
                  <p className="text-red-600 font-medium mb-2">
                    녹음 중... {formatDuration(recordingDuration)}
                  </p>
                  <button
                    onClick={stopAudioRecording}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <MicOff className="w-4 h-4 inline mr-2" />
                    녹음 종료
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">음성 메모 녹음됨</p>
                    <p className="text-green-600 text-sm">{formatDuration(recordingDuration)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={playAudioRecording}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={deleteAudioRecording}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personal Meaning */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            개인적인 의미나 생각
          </label>
          <textarea
            value={personalMeaning}
            onChange={(e) => setPersonalMeaning(e.target.value)}
            placeholder="이 작품이 나에게 어떤 의미인지, 어떤 기억이나 생각이 드는지 자유롭게 적어보세요. 가족, 친구, 과거의 경험, 꿈이나 희망 등 무엇이든 좋습니다."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {personalMeaning.length}/1000자
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={saveResponse}
            disabled={!hasSelectedEmotions || isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                저장 중...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                감정 기록 저장
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default EmotionalResponseRecorder;