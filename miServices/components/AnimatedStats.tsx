'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 15, suffix: '+', label: 'Years of experience' },
  { value: 700, suffix: '+', label: 'Letting agents served' },
  { value: 150, suffix: 'k+', label: 'Reports created' },
  { value: 150, suffix: 'k+', label: 'Properties surveyed' },
  { value: 60, suffix: '+', label: 'Franchise locations' },
];

export default function AnimatedStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers: NodeJS.Timeout[] = [];

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.min(
            Math.round(increment * currentStep),
            stat.value
          );
          return newCounts;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-brand-dark-blue via-[#4a68b8] to-brand-light-blue text-white relative overflow-hidden animate-stats-bg"
    >
      <div className="absolute inset-0 opacity-20 animate-shimmer-bg" />
      
      <svg 
        className="absolute top-0 right-0 w-64 h-64 opacity-10 animate-float-svg" 
        viewBox="0 0 200 200" 
        fill="none"
      >
        <path d="M 0 100 Q 50 50 100 100 Q 150 150 200 100 L 200 200 L 0 200 Z" fill="white"/>
      </svg>

      <svg 
        className="absolute bottom-0 left-0 w-64 h-64 opacity-10 animate-float-svg-delayed" 
        viewBox="0 0 200 200" 
        fill="none"
      >
        <path d="M 0 100 Q 50 150 100 100 Q 150 50 200 100 L 200 0 L 0 0 Z" fill="white"/>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-helvetica">
          We take pride in our numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center transform transition-all duration-500 hover:scale-110 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2 font-helvetica">
                {counts[index]}
                {stat.suffix}
              </div>
              <div className="text-sm md:text-base opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
