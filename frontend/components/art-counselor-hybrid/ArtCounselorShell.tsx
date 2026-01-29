'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ArtCounselorShellProps {
  artworkPanel: ReactNode;
  conversationPanel: ReactNode;
  summaryPanel: ReactNode;
  className?: string;
}

export function ArtCounselorShell({
  artworkPanel,
  conversationPanel,
  summaryPanel,
  className,
}: ArtCounselorShellProps) {
  return (
    <div className={cn('min-h-screen bg-[#0f0f10]', className)}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f10] via-[#141418] to-[#0f0f10]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(180,160,140,0.03) 0%, transparent 60%)',
          }}
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Artwork Panel - Left */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:col-span-4 lg:order-none"
          >
            <div className="sticky top-8">
              {artworkPanel}
            </div>
          </motion.section>

          {/* Conversation Panel - Center */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-3 lg:col-span-5 lg:order-none"
          >
            <div className="rounded-sm border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden min-h-[600px] flex flex-col">
              {conversationPanel}
            </div>
          </motion.section>

          {/* Summary Panel - Right */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:col-span-3 lg:order-none"
          >
            <div className="sticky top-8 rounded-sm border border-white/10 bg-white/[0.02] backdrop-blur-sm">
              {summaryPanel}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
