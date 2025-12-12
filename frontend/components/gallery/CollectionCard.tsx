'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import type { Collection } from '@/types/gallery';

interface CollectionCardProps {
  collection: Collection & { coverImages: string[] };
  onUpdate: () => void;
}

export default function CollectionCard({ collection, onUpdate }: CollectionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // TODO: Implement collection detail page
    console.log('Navigate to collection:', collection.id);
  };

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="aspect-[4/3] bg-white border border-neutral-200 hover:border-neutral-900 overflow-hidden transition-all group relative"
    >
      {/* Cover Images - 2x2 Grid */}
      {collection.coverType === 'auto' && collection.coverImages.length > 0 ? (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-neutral-100">
          {collection.coverImages.slice(0, 4).map((imageUrl, idx) => (
            <div key={idx} className="relative bg-neutral-100 overflow-hidden">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                sizes="150px"
              />
            </div>
          ))}
          {/* Fill empty slots */}
          {[...Array(Math.max(0, 4 - collection.coverImages.length))].map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-neutral-50" />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
          <span className="text-5xl opacity-20">{collection.emoji || '▪'}</span>
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Info - Always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <div className="flex items-baseline justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-black mb-0.5 truncate">
              {collection.name}
            </h3>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              {collection.itemCount} items
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Show context menu
            }}
            className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0 ml-2"
          >
            <MoreVertical className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Theme accent - subtle */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: collection.themeColor }}
      />
    </motion.button>
  );
}
