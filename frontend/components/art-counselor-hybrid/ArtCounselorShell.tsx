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
    <div
      className={cn(
        'mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)_minmax(0,1fr)]',
        className
      )}
    >
      <motion.section
        layout
        className="order-1 overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl lg:order-none"
      >
        {artworkPanel}
      </motion.section>

      <motion.section
        layout
        className="order-3 overflow-hidden rounded-3xl border border-white/5 bg-white/8 backdrop-blur-2xl lg:order-none"
      >
        {conversationPanel}
      </motion.section>

      <motion.aside
        layout
        className="order-2 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/6 via-white/3 to-white/6 backdrop-blur-xl lg:order-none"
      >
        {summaryPanel}
      </motion.aside>
    </div>
  );
}
