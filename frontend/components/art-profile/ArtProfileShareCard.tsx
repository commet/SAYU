'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Check, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SAYU_TYPES } from '@/../../shared/SAYUTypeDefinitions';
import { ART_STYLES } from '@/../../shared/apt-ai-prompt-mapping';
import toast from 'react-hot-toast';

interface ArtProfileShareCardProps {
  imageUrl: string;
  aptCode: string;
  artStyle: string;
  description: string;
  onClose?: () => void;
}

export default function ArtProfileShareCard({
  imageUrl,
  aptCode,
  artStyle,
  description,
  onClose
}: ArtProfileShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const aptInfo = SAYU_TYPES[aptCode];
  const styleInfo = ART_STYLES[artStyle];

  // 공유 텍스트 생성
  const shareText = `나는 ${aptInfo?.name} (${aptCode}) - ${aptInfo?.animal}! ${aptInfo?.emoji}

"${description}"

🎨 ${styleInfo?.nameKo} 스타일로 표현된 나의 예술 영혼

당신의 명화도 만들어보세요 👉 sayu.app/art-profile-ai`;

  // 클립보드 복사
  const handleCopyLink = async () => {
    const shareUrl = `https://sayu.app/art-profile-ai?apt=${aptCode}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('링크가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 텍스트 복사
  const handleCopyText = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success('공유 텍스트가 복사되었습니다!');
  };

  // 이미지 다운로드
  const handleDownload = async () => {
    try {
      // Data URL인 경우 직접 다운로드
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `sayu-${aptCode}-${artStyle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('이미지가 저장되었습니다!');
    } catch (err) {
      toast.error('다운로드에 실패했습니다');
    }
  };

  // 네이티브 공유 (모바일)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        // 이미지 blob 생성 시도
        let shareData: ShareData = {
          title: `나는 ${aptInfo?.name}!`,
          text: shareText,
          url: `https://sayu.app/art-profile-ai?apt=${aptCode}`
        };

        // data URL을 blob으로 변환하여 공유 시도
        if (imageUrl.startsWith('data:')) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `sayu-${aptCode}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData = {
                ...shareData,
                files: [file]
              };
            }
          } catch {
            // 파일 공유 실패 시 텍스트만 공유
          }
        }

        await navigator.share(shareData);
      } catch (err) {
        // 사용자가 취소한 경우
        if ((err as Error).name !== 'AbortError') {
          toast.error('공유에 실패했습니다');
        }
      }
    } else {
      handleCopyText();
    }
  };

  // 트위터 공유
  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(shareText.slice(0, 240));
    const url = encodeURIComponent(`https://sayu.app/art-profile-ai?apt=${aptCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`, '_blank');
  };

  // 인스타그램 공유 가이드
  const handleInstagramGuide = () => {
    toast((t) => (
      <div className="text-sm">
        <p className="font-semibold mb-2">인스타그램 스토리 공유</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>아래 "이미지 저장" 버튼을 눌러주세요</li>
          <li>인스타그램 앱을 열고 스토리 추가</li>
          <li>저장된 이미지를 선택하세요</li>
        </ol>
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            handleDownload();
            toast.dismiss(t.id);
          }}
        >
          이미지 저장하기
        </Button>
      </div>
    ), {
      duration: 10000,
      style: {
        maxWidth: '300px'
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
      >
        {/* Image */}
        <div className="aspect-square relative">
          <img
            src={imageUrl}
            alt={`${aptCode} Art Profile`}
            className="w-full h-full object-cover"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Top Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2">
              <span className="text-xl">{aptInfo?.emoji}</span>
              <span className="text-white font-semibold">{aptCode}</span>
            </div>
          </div>

          {/* Style Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 bg-purple-500/20 backdrop-blur-md rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm">{styleInfo?.nameKo}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5 text-center">
          <h3 className="text-xl font-bold text-white mb-1">
            {aptInfo?.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            {aptInfo?.animal} · {styleInfo?.name}
          </p>
          <p className="text-gray-300 text-sm italic">
            "{description}"
          </p>

          {/* SAYU Branding */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="text-gray-400 text-sm">SAYU</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-xs">sayu.app</span>
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <div className="mt-6 space-y-4">
        {/* Primary Share Button */}
        <Button
          onClick={handleNativeShare}
          className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg font-semibold"
        >
          <Share2 className="w-5 h-5 mr-2" />
          공유하기
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
          >
            <Download className="w-5 h-5 mb-1" />
            <span className="text-xs">저장</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
          >
            {copied ? (
              <Check className="w-5 h-5 mb-1 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">링크</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleInstagramGuide}
            className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
          >
            <Instagram className="w-5 h-5 mb-1" />
            <span className="text-xs">인스타</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleTwitterShare}
            className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
          >
            <Twitter className="w-5 h-5 mb-1" />
            <span className="text-xs">트위터</span>
          </Button>
        </div>
      </div>

      {/* Viral CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 text-center"
      >
        <p className="text-sm text-gray-300 mb-1">
          친구에게 공유하면 당신의 예술 케미도 알 수 있어요!
        </p>
        <p className="text-xs text-purple-400">
          🎨 16가지 예술 성격 유형 × 5가지 아트 스타일
        </p>
      </motion.div>

      {/* Close */}
      {onClose && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            닫기
          </Button>
        </div>
      )}
    </motion.div>
  );
}
