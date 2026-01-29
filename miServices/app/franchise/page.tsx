'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { FiAward, FiTrendingUp, FiHome, FiSmartphone, FiBookOpen, FiUsers, FiCheck, FiMapPin, FiStar } from 'react-icons/fi';
import FranchiseProspectusForm from '@/components/forms/FranchiseProspectusForm';
import CalendarModal from '@/components/ui/CalendarModal';
import FAQAccordion from '@/components/ui/FAQAccordion';
import FiPoundSign from '@/components/icons/FiPoundSign';

export default function FranchisePage() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const benefits = [
    {
      icon: FiAward,
      title: 'A Proven Business Model',
      description: 'Over a decade of success delivering property reports for letting agents, landlords, student accommodation providers and block management companies.',
    },
    {
      icon: FiTrendingUp,
      title: 'A Growing Industry',
      description: 'The rental sector continues to expand — and compliance requirements with it. Agents rely on consistent, professional reporting more than ever.',
    },
    {
      icon: FiHome,
      title: 'Low Overheads, High Potential',
      description: 'Work from home, operate flexibly, and scale at your own pace. No office required.',
    },
    {
      icon: FiSmartphone,
      title: 'Powerful Technology',
      description: 'Our integrated software (miProgram) enables fast, accurate and standardised reporting from day one.',
    },
    {
      icon: FiBookOpen,
      title: 'Full Training & Ongoing Support',
      description: 'We train you in inventory reporting, check-in & check-out inspections, property visits, customer service, sales & business growth, and operational processes.',
    },
    {
      icon: FiUsers,
      title: 'A Network that Works Together',
      description: 'Benefit from referrals, centralised marketing, proven workflows, and a supportive peer community.',
    },
  ];

  const clients = [
    'Letting agents',
    'Property managers',
    'Portfolio landlords',
    'Student accommodation providers',
    'Build-to-rent operators',
    'Block management companies',
  ];

  const included = [
    'All training',
    'Business setup guidance',
    'Branding',
    'Operational processes',
    'Marketing material',
    'Ongoing network support',
    'Priority access to centrally managed work',
    'Head Office backup during busy periods and holidays',
    'Dedicated booking team at your disposal',
    'Full admin management support (if required)',
  ];

  const steps = [
    {
      number: '1',
      title: 'Initial Call',
      description: 'We discuss your background, goals, and territory availability.',
    },
    {
      number: '2',
      title: 'Face-to-Face or Video Meeting',
      description: 'Dive deeper into the business model, earnings, workload and support.',
    },
    {
      number: '3',
      title: 'Speak to Real Franchisees',
      description: 'Get honest, first-hand experiences from our network.',
    },
    {
      number: '4',
      title: 'Pre-Contract Disclosure',
      description: 'We outline expectations, commitments, and operational responsibilities.',
    },
    {
      number: '5',
      title: 'Decision Time',
      description: 'Take your time. If we\'re the right match for each other, we\'ll welcome you into the miServices network.',
    },
  ];

  const testimonials = [
    {
      name: 'Richard Fellows',
      location: 'Twickenham',
      quote: 'As the new franchise owner for miServices Twickenham, I found the onboarding process streamlined and professional. The training was well-structured, giving me the knowledge, skills, and confidence I needed. I\'m excited to continue building local connections and growing my franchise.',
    },
    {
      name: 'Shane Osman',
      location: 'Hertfordshire, Bedfordshire & Watford',
      quote: 'The miServices franchise suited my budget, and I was drawn to the low overheads and simple business model. We\'ve grown our turnover from four figures to six figures annually over the last four years.',
    },
    {
      name: 'Alex Spedding',
      location: 'West Midlands',
      quote: 'After growing to the point where we needed staff, Head Office guided us through the recruitment process. They helped with legal documents, tailored support, and online training — all of which were invaluable to our continued growth.',
    },
  ];

  const faqs = [
    {
      question: 'What experience do I need?',
      answer: 'None. Full training is provided. Many franchisees come from property, customer service, operations, or completely unrelated industries.',
    },
    {
      question: 'Do I need an office?',
      answer: 'No — you can run the entire business from home. Low overheads = higher margins.',
    },
    {
      question: 'How much can I earn?',
      answer: 'Income varies per territory, but many established franchisees operate profitable full-time businesses, with some growing to six-figure turnover.',
    },
    {
      question: 'Is the work flexible?',
      answer: 'Yes. You choose your working hours and can scale up or down based on your goals.',
    },
    {
      question: 'Do I get my own territory?',
      answer: 'Yes. Each franchise is protected by clearly defined postcode territories.',
    },
    {
      question: 'How quickly can I launch?',
      answer: 'Training and onboarding can be completed in weeks, depending on availability.',
    },
    {
      question: 'Do I need property experience?',
      answer: 'Not at all. Our training covers everything you need to know.',
    },
    {
      question: 'Is the demand consistent?',
      answer: 'Very. The rental market operates year-round, with seasonal spikes during summer and autumn.',
    },
    {
      question: 'Can I hire a team as I grow?',
      answer: 'Yes — and we\'ll support you with recruitment, documents, and training.',
    },
    {
      question: 'What support do I get after launch?',
      answer: 'Ongoing operational support, marketing guidance, software updates, peer network, and access to our head office team.',
    },
  ];

  const featuredTerritories = [
    {
      name: 'Guildford',
      price: '£50,000',
      description: 'Established territory with £50,000 of work already generated with no marketing or sales activity. Excellent growth potential in this affluent area.',
      highlight: 'Going Concern',
    },
    {
      name: 'Manchester',
      price: '£40,000',
      description: '£40,000 of work with no marketing or sales activity, currently managed by head office. Prime location with strong lettings market.',
      highlight: 'Going Concern',
    },
  ];

  const availableTerritories = [
    { name: 'Bristol', postcodes: 'BS1-BS16', price: '£9,995' },
    { name: 'Cambridge', postcodes: 'CB1-CB8', price: '£12,995' },
    { name: 'Brighton', postcodes: 'BN1-BN3', price: '£14,995' },
    { name: 'York', postcodes: 'YO1, YO10, YO19', price: '£7,995' },
    { name: 'Exeter', postcodes: 'EX1-EX6', price: '£8,995' },
    { name: 'Norwich', postcodes: 'NR1-NR9', price: '£6,995' },
    { name: 'Oxford', postcodes: 'OX1-OX4', price: '£11,995' },
    { name: 'Bath', postcodes: 'BA1-BA2', price: '£9,995' },
  ];

  return (
    <>
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-helvetica">
            Build a Business in the UK Property Sector from Just £995 – £19,995
          </h1>
          <p className="text-xl md:text-2xl text-white opacity-90 mb-8">
            Join the UK's Trusted Nationwide Inventory Clerk Network
          </p>
          <p className="text-lg text-white opacity-85 mb-10 max-w-4xl mx-auto leading-relaxed">
            Become part of a rapidly growing industry where demand has never been higher. Start your miServices franchise and unlock a scalable property reporting business with low overheads, full training, and the backing of a national brand with over 65 active territories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <a
              href="#prospectus"
              className="inline-block bg-white text-brand-dark-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
            >
              Download Franchise Prospectus
            </a>
            <a
              href="#territories"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              View Available Territories
            </a>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              Book a Discovery Call
            </button>
          </div>
        </div>
      </section>

      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
            Watch: What It's Like to Run an miServices Franchise
          </h2>
          <div className="aspect-video bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="miServices Franchise Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Why Join miServices?
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              The property inventory and inspection sector is growing faster than ever. With over 5 million privately rented homes in the UK and increased compliance obligations on agents and landlords, the demand for professional property inspection and reporting services is at an all-time high.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto mt-4">
              miServices is one of the UK's leading inventory clerk networks — and the first dedicated inventory franchise. With over 700+ letting agents, 100+ professionals, and 65+ territories, we give franchise partners the tools, training, and support needed to build a thriving, long-term business.
            </p>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-8 text-center font-helvetica">
            The Benefits of an miServices Franchise
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <benefit.icon className="w-12 h-12 text-brand-light-blue mb-4" />
                <h4 className="text-xl font-bold text-brand-dark-blue mb-3 font-helvetica">
                  {benefit.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Who You'll Work With
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
              As an miServices franchisee, you'll offer property reporting services to:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client, index) => (
              <div key={index} className="bg-gray-50 border-l-4 border-brand-light-blue p-4 rounded">
                <p className="text-gray-800 font-semibold flex items-center">
                  <FiCheck className="w-5 h-5 text-brand-light-blue mr-2" />
                  {client}
                </p>
              </div>
            ))}
          </div>

          <p className="text-lg text-gray-700 text-center mt-8">
            With so many operational areas, your earning potential is scalable, consistent, and diverse.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Low Startup Costs, Big Growth Potential
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white rounded-2xl p-10 shadow-2xl">
                <div className="mb-6">
                  <FiPoundSign className="w-16 h-16 mb-4 opacity-80" size={64} />
                  <p className="text-6xl font-bold mb-2">£995</p>
                  <p className="text-3xl font-semibold mb-4">to £19,995</p>
                  <p className="text-lg opacity-90">
                    Investment varies by territory size and location
                  </p>
                </div>
                <div className="border-t border-white border-opacity-30 pt-6">
                  <p className="text-xl font-semibold mb-3">Your Investment Includes:</p>
                  <p className="text-base opacity-90 leading-relaxed">
                    Everything you need to launch and grow a successful property reporting business — from training to ongoing support.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-dark-blue mb-6 font-helvetica flex items-center">
                <FiCheck className="w-8 h-8 text-brand-light-blue mr-3" />
                What's Included:
              </h3>
              <ul className="space-y-4">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-light-blue bg-opacity-10 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-opacity-20 transition-colors">
                      <FiCheck className="w-4 h-4 text-brand-light-blue" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-4 bg-brand-light-blue bg-opacity-5 rounded-lg border-l-4 border-brand-light-blue">
                <p className="text-brand-dark-blue font-semibold">
                  💡 The miServices model is designed to be profitable from your very first month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="territories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Available Territories
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Choose from a range of territories across the UK. Start fresh with a new area or take over an established going concern.
            </p>
          </div>

          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <FiStar className="w-8 h-8 text-yellow-500 mr-3" />
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue font-helvetica">
                Featured: Going Concern Territories
              </h3>
              <FiStar className="w-8 h-8 text-yellow-500 ml-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredTerritories.map((territory, index) => (
                <div key={index} className="relative bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      {territory.highlight}
                    </span>
                  </div>
                  <FiMapPin className="w-12 h-12 text-brand-light-blue mb-4" />
                  <h4 className="text-3xl font-bold text-brand-dark-blue mb-3 font-helvetica">
                    {territory.name}
                  </h4>
                  <p className="text-4xl font-bold text-brand-light-blue mb-4">
                    {territory.price}
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {territory.description}
                  </p>
                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="w-full bg-brand-light-blue text-white px-6 py-3 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-md"
                  >
                    Enquire About This Territory
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-8 text-center font-helvetica">
              New Territory Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableTerritories.map((territory, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <FiMapPin className="w-8 h-8 text-brand-light-blue mb-3" />
                  <h4 className="text-xl font-bold text-brand-dark-blue mb-2 font-helvetica">
                    {territory.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{territory.postcodes}</p>
                  <p className="text-2xl font-bold text-brand-light-blue">
                    {territory.price}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-gray-700">
              Don't see your preferred area? <button onClick={() => setIsCalendarOpen(true)} className="text-brand-light-blue font-semibold hover:underline">Contact us</button> to discuss custom territory options.
            </p>
          </div>
        </div>
      </section>

      <section id="prospectus" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-6 font-helvetica">
              Download the miServices Franchise Prospectus
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Enter your details below to receive the full information pack, including earning potential, territory availability, training details, and next steps.
            </p>
          </div>

          <FranchiseProspectusForm />
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-12 text-center font-helvetica">
            What Our Franchisees Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <p className="text-5xl text-brand-light-blue opacity-50">"</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  {testimonial.quote}
                </p>
                <div className="border-t pt-4">
                  <p className="font-bold text-brand-dark-blue">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-light-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-dark-blue rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-brand-dark-blue mb-4 font-helvetica">
              Your Journey to Becoming a Franchisee
            </h2>
            <p className="text-xl text-gray-600">
              A simple 5-step process to join the miServices network
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-light-blue to-brand-dark-blue hidden md:block"></div>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex gap-6 items-start group">
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-light-blue to-brand-dark-blue text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-brand-light-blue">
                      <h3 className="text-2xl font-bold text-brand-dark-blue mb-3 font-helvetica group-hover:text-brand-light-blue transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-gradient-to-r from-brand-light-blue to-brand-dark-blue text-white px-12 py-5 rounded-lg font-helvetica font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              Book Your Franchise Discovery Call
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-12 text-center font-helvetica">
            Frequently Asked Questions
          </h2>

          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" transform="scale(1, -1)">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-helvetica">
            Ready to start your property inventory business?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join a trusted nationwide network with proven systems, full training, and strong demand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#prospectus"
              className="inline-block bg-white text-brand-dark-blue px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
            >
              Download Franchise Prospectus
            </a>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-white hover:text-brand-dark-blue transition-all"
            >
              Contact Franchise Team
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
