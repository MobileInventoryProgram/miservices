'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setProgress(100);
    setLoading(true);

    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    completionTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setProgress(0);
      completionTimeoutRef.current = null;
    }, 300);

    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link || !link.href) return;
      
      if (link.target === '_blank' || link.target === '_parent' || link.target === '_top') {
        return;
      }
      
      if (!link.href.startsWith(window.location.origin) || link.href.includes('#')) {
        return;
      }

      const targetUrl = new URL(link.href);
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const targetFullPath = `${targetUrl.pathname}${targetUrl.search}`;
      
      if (targetFullPath !== currentUrl) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        if (completionTimeoutRef.current) {
          clearTimeout(completionTimeoutRef.current);
          completionTimeoutRef.current = null;
        }

        setLoading(true);
        setProgress(0);
        
        let currentProgress = 0;
        progressIntervalRef.current = setInterval(() => {
          currentProgress += Math.random() * 15;
          if (currentProgress >= 90) {
            currentProgress = 90;
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
          setProgress(currentProgress);
        }, 100);
      }
    };

    const handlePopState = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }

      setLoading(true);
      setProgress(0);
      
      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 90) {
          currentProgress = 90;
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
        setProgress(currentProgress);
      }, 100);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = null;
      }
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-1 bg-gradient-to-r from-brand-dark-blue via-brand-light-blue to-brand-dark-blue transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: loading ? 1 : 0,
      }}
    >
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />
    </div>
  );
}
