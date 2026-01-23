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
        'mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)_minmax(0,1fr)]',
        className
      )}
    >
      <motion.section
        layout
        className="order-1 overflow-hidden border border-neutral-200 bg-white p-6 lg:order-none"
      >
        {artworkPanel}
      </motion.section>

      <motion.section
        layout
        className="order-3 overflow-hidden border border-neutral-200 bg-white lg:order-none"
      >
        {conversationPanel}
      </motion.section>

      <motion.aside
        layout
        className="order-2 overflow-hidden border border-neutral-200 bg-neutral-50 lg:order-none"
      >
        {summaryPanel}
      </motion.aside>
    </div>
  );
}
