import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

interface TimelineItem {
  year?: string;
  title: string;
  description: string;
}


export default function Timeline({ heading, text, milestones }: { heading?: string; text?: string; milestones: TimelineItem[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-4 font-helvetica">
            {heading}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            {text}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border-t-4 border-brand-light-blue hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start mb-3">
                <FiCheckCircle className="w-6 h-6 text-brand-light-blue mt-1 mr-3 flex-shrink-0" />
                <div>
                  {milestone.year && (
                    <span className="text-2xl font-bold text-brand-dark-blue font-helvetica block mb-2">
                      {milestone.year}
                    </span>
                  )}
                  <h3 className="text-lg font-helvetica font-semibold text-brand-dark-blue">
                    {milestone.title}
                  </h3>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
