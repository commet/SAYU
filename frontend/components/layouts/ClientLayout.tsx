'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import FloatingNav from '@/components/navigation/FloatingNav';
import MobileNav from '@/components/navigation/MobileNav';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Pages where we don't want to show the navigation
  // These are immersive experiences that need full screen
  const hideNavPaths = ['/quiz/scenario', '/quiz/narrative'];
  const shouldHideNav = hideNavPaths.some(path => pathname?.startsWith(path));

  // Clean up any legacy floating nav elements (old dark/purple bar) if still mounted in DOM
  useEffect(() => {
    const selectors = [
      '.sayu-floating-nav',
      'div.fixed.top-0.left-0.right-0.z-\\[1000\\].px-4.pt-4.bg-gray-900',
      'div[class*="fixed"][class*="top-0"][class*="z-\\\\[1000\\\\]"][class*="bg-gray-900"]',
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }, []);

  return (
    <>
      {!shouldHideNav && (
        <>
          <div className="hidden lg:block">
            <FloatingNav />
          </div>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </>
      )}
      <main className={!shouldHideNav ? 'pt-20 pb-24 lg:pb-0 has-mobile-nav' : ''}>
        {children}
      </main>
    </>
  );
}
