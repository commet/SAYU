'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Palette } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function SafeImage({
  src,
  alt,
  className = '',
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  width = 400,
  height = 300
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Empty src fallback
  if (!src || error) {
    return (
      <div
        className={`${fill ? 'absolute inset-0' : ''} bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <Palette className="w-12 h-12 text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400 line-clamp-1">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${fill ? 'absolute inset-0' : ''}`} style={!fill ? { width, height } : undefined}>
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        fill={fill}
        sizes={sizes}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
