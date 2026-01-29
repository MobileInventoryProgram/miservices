import React from 'react';
import { IconType } from 'react-icons';

interface FeatureCard {
  icon: IconType;
  title: string;
  description: string;
}

interface FeatureCardsProps {
  title: string;
  subtitle?: string;
  features: FeatureCard[];
  background?: 'white' | 'gray';
}

export default function FeatureCards({ title, subtitle, features, background = 'white' }: FeatureCardsProps) {
  const bgClass = background === 'gray' ? 'bg-gray-50' : 'bg-white';

  return (
    <section className={`py-16 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4 font-helvetica">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brand-dark-blue to-brand-light-blue rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-helvetica font-semibold text-brand-dark-blue mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
