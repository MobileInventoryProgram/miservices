'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { FiMapPin, FiPhone, FiMail, FiCheckCircle, FiUser } from 'react-icons/fi';

interface Franchisee {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  postCodes: string | null;
  territory: string | null;
  townsCities: string | null;
  slug: string;
  tags: string[] | null;
}

export default function FranchiseePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchFranchisee = async () => {
      try {
        const response = await fetch(`/api/franchisees/${slug}`);
        if (response.ok) {
          const data: Franchisee = await response.json();
          setFranchisee(data);
        } else {
          setNotFoundError(true);
        }
      } catch (error) {
        console.error('Error fetching franchisee:', error);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchisee();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark-blue"></div>
      </div>
    );
  }

  if (notFoundError || !franchisee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Operative Not Found</h1>
          <p className="text-gray-600 mb-6">The franchisee you're looking for could not be found.</p>
          <Link href="/our-network" className="text-brand-light-blue hover:underline">
            ← Back to Our Network
          </Link>
        </div>
      </div>
    );
  }

  const postcodesArray = franchisee.postCodes ? franchisee.postCodes.split(',').map(pc => pc.trim()) : [];
  const locationsArray = franchisee.townsCities ? franchisee.townsCities.split(',').map(loc => loc.trim()) : [];

  const defaultServices = [
    'Property Inventory Reports',
    'Check-In Inspections',
    'Check-Out Inspections',
    'Mid-Term Inspections',
    'Property Visits',
    'Photographic Evidence',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-brand-dark-blue to-brand-light-blue text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" fill="none" className="w-full h-full">
            <path d="M 0 400 Q 300 200 600 400 Q 900 600 1200 400 L 1200 800 L 0 800 Z" fill="white"/>
            <path d="M 0 500 Q 300 300 600 500 Q 900 700 1200 500 L 1200 800 L 0 800 Z" fill="white" opacity="0.5"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-helvetica">
            {franchisee.companyName || `miServices - ${franchisee.territory}`}
          </h1>
          <p className="text-xl md:text-2xl opacity-95">
            Professional Property Inspection Services
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-brand-dark-blue font-helvetica">
                About {franchisee.name}
              </h2>
              <p className="text-lg text-brand-light-blue mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                {franchisee.territory || 'UK Territory'}
              </p>
              <p className="text-gray-700 leading-relaxed">
                Professional property inspection services provided by {franchisee.name}. 
                We offer comprehensive property inventory reports, check-in and check-out inspections, 
                and mid-term property visits across our coverage area.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h3 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">Services Available</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {defaultServices.map((service, idx) => (
                  <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiCheckCircle className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
                    <span className="font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {postcodesArray.length > 0 && (
              <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h3 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">Postcodes We Cover</h3>
                <p className="text-gray-600 mb-4">
                  We provide professional property inspection services across all the following postcodes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {postcodesArray.map((postcode, idx) => (
                    <span key={idx} className="bg-brand-light-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                      {postcode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {locationsArray.length > 0 && (
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6 text-brand-dark-blue font-helvetica">Areas We Cover</h3>
                <p className="text-gray-600 mb-4">
                  Our property inspection services are available across the following locations:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {locationsArray.map((location, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <FiMapPin className="text-brand-light-blue mr-2 flex-shrink-0" size={16} />
                      <span className="text-sm">{location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-brand-dark-blue font-helvetica">Contact Information</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <FiUser className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Operative</p>
                    <p className="text-gray-600">{franchisee.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiMapPin className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Territory</p>
                    <p className="text-gray-600">{franchisee.territory || 'UK'}</p>
                  </div>
                </div>

                {franchisee.phone && (
                  <div className="flex items-center">
                    <FiPhone className="text-brand-light-blue mr-3 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${franchisee.phone}`} className="text-brand-light-blue hover:underline">
                        {franchisee.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <FiMail className="text-brand-light-blue mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${franchisee.email}`} className="text-brand-light-blue hover:underline break-all">
                      {franchisee.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/booking"
                  className="block w-full bg-brand-light-blue text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 text-center transition-all"
                >
                  Book a Service
                </Link>
                <Link
                  href="/contact"
                  className="block w-full border-2 border-brand-light-blue text-brand-light-blue px-6 py-3 rounded-md font-medium hover:bg-brand-light-blue hover:text-white text-center transition-all"
                >
                  Send Enquiry
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href="/our-network" className="text-brand-light-blue hover:underline flex items-center">
                  <FiMapPin className="mr-2" />
                  View All Operatives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
