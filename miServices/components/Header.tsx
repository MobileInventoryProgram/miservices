'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiFileText, FiCheckCircle, FiMapPin, FiUsers, FiHome, FiBriefcase, FiPhone, FiMail, FiSearch, FiBook, FiHelpCircle, FiShield, FiFileText as FiFile, FiCalendar } from 'react-icons/fi';
import FiPoundSign from '@/components/icons/FiPoundSign';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="miServices Logo" 
                  width={360} 
                  height={120}
                  className="h-28 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <div className="relative group">
                <button
                  className="text-gray-700 hover:text-brand-dark-blue font-medium flex items-center"
                  onMouseEnter={() => setActiveDropdown('services')}
                >
                  Services <FiChevronDown className="ml-1" />
                </button>
                {activeDropdown === 'services' && (
                  <div
                    className="fixed left-0 right-0 top-32 bg-white shadow-xl border-t-2 border-brand-light-blue"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="grid grid-cols-3 gap-12">
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Our Services</h3>
                          <Link href="/inventory-reports" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiFileText className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Inventory Reports</div>
                              <div className="text-sm text-gray-500">Complete property documentation</div>
                            </div>
                          </Link>
                          <Link href="/check-ins" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiCheckCircle className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Check-in</div>
                              <div className="text-sm text-gray-500">Tenant move-in services</div>
                            </div>
                          </Link>
                          <Link href="/check-outs" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiCheckCircle className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Check-out</div>
                              <div className="text-sm text-gray-500">End of tenancy inspections</div>
                            </div>
                          </Link>
                          <Link href="/property-visits" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiMapPin className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Property Visits</div>
                              <div className="text-sm text-gray-500">Regular property inspections</div>
                            </div>
                          </Link>
                          <Link href="/block-management" onClick={() => setActiveDropdown(null)} className="group flex items-start hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiHome className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Block Management</div>
                              <div className="text-sm text-gray-500">Multi-unit property services</div>
                            </div>
                          </Link>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Tenancy Journey</h3>
                          <div className="space-y-3">
                            <Link href="/pre-tenancy" onClick={() => setActiveDropdown(null)} className="flex items-start p-3 bg-brand-dark-blue/5 rounded-md border-l-2 border-brand-dark-blue hover:bg-brand-dark-blue/10 transition-colors group">
                              <div className="flex-shrink-0 w-10 h-10 bg-brand-dark-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-dark-blue/20">
                                <span className="text-brand-dark-blue font-bold text-lg">1</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-brand-dark-blue">Pre-Tenancy</div>
                                <div className="text-sm text-gray-500">Initial property setup</div>
                              </div>
                            </Link>
                            <Link href="/mid-tenancy" onClick={() => setActiveDropdown(null)} className="flex items-start p-3 bg-brand-dark-blue/5 rounded-md border-l-2 border-brand-dark-blue hover:bg-brand-dark-blue/10 transition-colors group">
                              <div className="flex-shrink-0 w-10 h-10 bg-brand-dark-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-dark-blue/20">
                                <span className="text-brand-dark-blue font-bold text-lg">2</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-brand-dark-blue">Mid-Tenancy</div>
                                <div className="text-sm text-gray-500">Ongoing inspections</div>
                              </div>
                            </Link>
                            <Link href="/end-tenancy" onClick={() => setActiveDropdown(null)} className="flex items-start p-3 bg-brand-dark-blue/5 rounded-md border-l-2 border-brand-dark-blue hover:bg-brand-dark-blue/10 transition-colors group">
                              <div className="flex-shrink-0 w-10 h-10 bg-brand-dark-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-dark-blue/20">
                                <span className="text-brand-dark-blue font-bold text-lg">3</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-brand-dark-blue">End-Tenancy</div>
                                <div className="text-sm text-gray-500">Final checkout process</div>
                              </div>
                            </Link>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Who We Work With</h3>
                          <Link href="/lettings-agents" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiBriefcase className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Lettings Agents</div>
                              <div className="text-sm text-gray-500">Streamline your workflow</div>
                            </div>
                          </Link>
                          <Link href="/property-managers" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiUsers className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Property Managers</div>
                              <div className="text-sm text-gray-500">Portfolio solutions</div>
                            </div>
                          </Link>
                          <Link href="/landlords" onClick={() => setActiveDropdown(null)} className="group flex items-start hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiHome className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Landlords</div>
                              <div className="text-sm text-gray-500">Protect your investment</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="text-gray-700 hover:text-brand-dark-blue font-medium flex items-center"
                  onMouseEnter={() => setActiveDropdown('network')}
                >
                  Our Network <FiChevronDown className="ml-1" />
                </button>
                {activeDropdown === 'network' && (
                  <div
                    className="fixed left-0 right-0 top-32 bg-white shadow-xl border-t-2 border-brand-light-blue"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="grid grid-cols-3 gap-12">
                        <div className="col-span-2">
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Find Your Local Operative</h3>
                          <div className="bg-gradient-to-br from-brand-dark-blue/5 to-brand-light-blue/5 rounded-lg p-8 border-l-4 border-brand-light-blue">
                            <h4 className="text-2xl font-bold text-brand-dark-blue mb-4 font-helvetica">Nationwide Coverage</h4>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                              Our network of professional operatives covers the entire UK. Each franchise is independently owned and operated, providing local expertise with national quality standards.
                            </p>
                            <Link 
                              href="/our-network"
                              onClick={() => setActiveDropdown(null)}
                              className="inline-flex items-center gap-2 bg-brand-light-blue text-white px-6 py-3 rounded-md font-medium hover:bg-brand-dark-blue transition-colors"
                            >
                              <FiSearch size={18} />
                              Find Your Nearest Operative
                            </Link>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Franchise Opportunities</h3>
                          <div className="bg-gradient-to-br from-brand-dark-blue/5 to-brand-light-blue/5 rounded-lg p-6 border-l-4 border-brand-dark-blue">
                            <h4 className="text-xl font-bold text-brand-dark-blue mb-3 font-helvetica">Build Your Own Business</h4>
                            <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                              Join the UK's trusted property inspection network. Low startup costs from £995, full training, and ongoing support.
                            </p>
                            <Link 
                              href="/franchise"
                              onClick={() => setActiveDropdown(null)}
                              className="inline-flex items-center gap-2 bg-brand-dark-blue text-white px-6 py-3 rounded-md font-medium hover:bg-brand-light-blue transition-colors"
                            >
                              <FiBriefcase size={18} />
                              Explore Franchise Opportunities
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button
                  className="text-gray-700 hover:text-brand-dark-blue font-medium flex items-center"
                  onMouseEnter={() => setActiveDropdown('more')}
                >
                  More <FiChevronDown className="ml-1" />
                </button>
                {activeDropdown === 'more' && (
                  <div
                    className="fixed left-0 right-0 top-32 bg-white shadow-xl border-t-2 border-brand-light-blue"
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="grid grid-cols-3 gap-12">
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Company</h3>
                          <Link href="/contact" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiPhone className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Contact Us</div>
                              <div className="text-sm text-gray-500">Get in touch with us today</div>
                            </div>
                          </Link>
                          <Link href="/about" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiBriefcase className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">About Us</div>
                              <div className="text-sm text-gray-500">Our mission and values</div>
                            </div>
                          </Link>
                          <Link href="/our-team" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiUsers className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Our Team</div>
                              <div className="text-sm text-gray-500">Meet the experts</div>
                            </div>
                          </Link>
                          <Link href="/franchise" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiBriefcase className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Franchise</div>
                              <div className="text-sm text-gray-500">Business opportunities</div>
                            </div>
                          </Link>
                          <Link href="/booking" onClick={() => setActiveDropdown(null)} className="group flex items-start hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiCalendar className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Booking</div>
                              <div className="text-sm text-gray-500">Schedule a service</div>
                            </div>
                          </Link>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Resources</h3>
                          <Link href="/sample-documents" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiFile className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Sample Documents</div>
                              <div className="text-sm text-gray-500">View report samples</div>
                            </div>
                          </Link>
                          <Link href="/news" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiBook className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">News</div>
                              <div className="text-sm text-gray-500">Latest updates and insights</div>
                            </div>
                          </Link>
                          <Link href="/pricing" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiPoundSign className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Pricing</div>
                              <div className="text-sm text-gray-500">Transparent pricing</div>
                            </div>
                          </Link>
                          <Link href="/faq" onClick={() => setActiveDropdown(null)} className="group flex items-start hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiHelpCircle className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">FAQ</div>
                              <div className="text-sm text-gray-500">Common questions</div>
                            </div>
                          </Link>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-brand-dark-blue mb-6 font-helvetica uppercase tracking-wider">Legals</h3>
                          <Link href="/privacy-policy" onClick={() => setActiveDropdown(null)} className="group flex items-start mb-4 hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiShield className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Privacy Policy</div>
                              <div className="text-sm text-gray-500">How we protect your data</div>
                            </div>
                          </Link>
                          <Link href="/terms" onClick={() => setActiveDropdown(null)} className="group flex items-start hover:bg-brand-light-blue/5 p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-brand-light-blue">
                            <div className="flex-shrink-0 w-10 h-10 bg-brand-light-blue/10 rounded-md flex items-center justify-center mr-3 group-hover:bg-brand-light-blue/20">
                              <FiFileText className="text-brand-light-blue" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 group-hover:text-brand-light-blue">Terms & Conditions</div>
                              <div className="text-sm text-gray-500">Our terms of service</div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <Link
                href="/contact"
                className="border-2 border-brand-dark-blue text-brand-dark-blue px-6 py-2 rounded-md font-medium hover:bg-brand-dark-blue hover:text-white transition-all duration-300"
              >
                Contact
              </Link>
              <Link
                href="/booking"
                className="bg-brand-light-blue text-white px-6 py-2 rounded-md font-medium hover:bg-white hover:text-brand-light-blue hover:border-2 hover:border-brand-light-blue transition-all duration-300"
              >
                Booking
              </Link>
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-brand-dark-blue"
              >
                {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => toggleDropdown('services-mobile')}
                    className="w-full text-left px-4 py-2 text-gray-700 font-medium flex justify-between items-center"
                  >
                    Services <FiChevronDown />
                  </button>
                  {activeDropdown === 'services-mobile' && (
                    <div className="pl-4 space-y-2">
                      <div>
                        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">Our Services</p>
                        <Link href="/inventory-reports" className="block px-4 py-1 text-gray-600">Inventory Reports</Link>
                        <Link href="/check-ins" className="block px-4 py-1 text-gray-600">Check-in</Link>
                        <Link href="/check-outs" className="block px-4 py-1 text-gray-600">Check-out</Link>
                        <Link href="/property-visits" className="block px-4 py-1 text-gray-600">Property Visits</Link>
                        <Link href="/block-management" className="block px-4 py-1 text-gray-600">Block Management</Link>
                      </div>
                      <div>
                        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">Who We Work With</p>
                        <Link href="/lettings-agents" className="block px-4 py-1 text-gray-600">Lettings Agents</Link>
                        <Link href="/property-managers" className="block px-4 py-1 text-gray-600">Property Managers</Link>
                        <Link href="/landlords" className="block px-4 py-1 text-gray-600">Landlords</Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/our-network" className="block px-4 py-2 text-gray-700 font-medium">Our Network</Link>

                <div>
                  <button
                    onClick={() => toggleDropdown('more-mobile')}
                    className="w-full text-left px-4 py-2 text-gray-700 font-medium flex justify-between items-center"
                  >
                    More <FiChevronDown />
                  </button>
                  {activeDropdown === 'more-mobile' && (
                    <div className="pl-4 space-y-2">
                      <div>
                        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">Company</p>
                        <Link href="/contact" className="block px-4 py-1 text-gray-600">Contact Us</Link>
                        <Link href="/about" className="block px-4 py-1 text-gray-600">About Us</Link>
                        <Link href="/our-team" className="block px-4 py-1 text-gray-600">Our Team</Link>
                        <Link href="/booking" className="block px-4 py-1 text-gray-600">Booking</Link>
                      </div>
                      <div>
                        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">Resources</p>
                        <Link href="/sample-documents" className="block px-4 py-1 text-gray-600">Sample Documents</Link>
                        <Link href="/news" className="block px-4 py-1 text-gray-600">News</Link>
                        <Link href="/pricing" className="block px-4 py-1 text-gray-600">Pricing</Link>
                        <Link href="/faq" className="block px-4 py-1 text-gray-600">FAQ</Link>
                      </div>
                      <div>
                        <p className="px-4 py-1 font-semibold text-brand-dark-blue text-sm">Legals</p>
                        <Link href="/privacy-policy" className="block px-4 py-1 text-gray-600">Privacy Policy</Link>
                        <Link href="/terms" className="block px-4 py-1 text-gray-600">Terms & Conditions</Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 pt-4 space-y-2">
                  <Link href="/contact" className="block w-full border-2 border-brand-dark-blue text-brand-dark-blue px-6 py-2 rounded-md font-medium text-center hover:bg-brand-dark-blue hover:text-white transition-all">
                    Contact
                  </Link>
                  <Link href="/booking" className="block w-full bg-brand-light-blue text-white px-6 py-2 rounded-md font-medium text-center hover:bg-white hover:text-brand-light-blue hover:border-2 hover:border-brand-light-blue transition-all">
                    Booking
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
