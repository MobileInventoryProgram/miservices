'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 100, suffix: '+', label: 'Professional Inventory Clerks' },
  { value: 30, suffix: '+', label: 'Head Office Staff' },
  { value: 2, suffix: '', label: 'Central Hubs' },
  { value: 65, suffix: '+', label: 'Territories' },
];

export default function AboutStats() {
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
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4 font-helvetica">
            A National Team With Local Expertise
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            What makes miServices different is the people behind it.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`text-center p-6 bg-gray-50 rounded-lg transform transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <div className="text-4xl font-bold text-brand-light-blue mb-2 font-helvetica">
                {counts[index]}
                {stat.suffix}
              </div>
              <div className="text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 mt-8 text-lg max-w-3xl mx-auto">
          This hybrid structure gives us the strength of a national brand with the reliability and local proximity customers expect.
        </p>
      </div>
    </section>
  );
}
