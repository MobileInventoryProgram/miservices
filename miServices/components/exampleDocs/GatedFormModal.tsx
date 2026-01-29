'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FiCheckCircle, FiDownload, FiX } from 'react-icons/fi';

interface GatedFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'Inventory' | 'Check-Out' | 'Property Visit';
}

export default function GatedFormModal({ isOpen, onClose, documentType }: GatedFormModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sample-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          documentType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setDocumentUrl(data.documentUrl || '#');
      } else {
        setErrors({ submit: data.error || 'Failed to submit form. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      privacyConsent: false,
      marketingConsent: false,
    });
    setErrors({});
    setIsSuccess(false);
    setDocumentUrl('');
    setIsSubmitting(false);
    onClose();
  };

  const getDocumentFileName = () => {
    switch (documentType) {
      case 'Inventory':
        return 'miServices_Inventory_Report_Sample.pdf';
      case 'Check-Out':
        return 'miServices_CheckOut_Report_Sample.pdf';
      case 'Property Visit':
        return 'miServices_Property_Visit_Sample.pdf';
      default:
        return 'miServices_Sample_Document.pdf';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FiX className="w-6 h-6 text-gray-600" />
        </button>

        <div className="p-8">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-brand-dark-blue mb-4 font-helvetica">
              Your Sample Document is Now Available
            </h3>
            <p className="text-gray-700 mb-8 text-lg">
              Thank you for your interest! Click the button below to view your {documentType} report sample.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={documentUrl}
                download={getDocumentFileName()}
                className="inline-flex items-center justify-center gap-2 bg-brand-light-blue text-white px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                <FiDownload className="w-5 h-5" />
                Download Sample Document
              </a>
              <button
                onClick={handleClose}
                className="inline-block bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-helvetica font-semibold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-3xl font-bold text-brand-dark-blue mb-2 font-helvetica">
              Access {documentType} Report Sample
            </h3>
            <p className="text-gray-600 mb-6">
              Please complete the form below to view the sample document.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
              />

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                required
              />

              <Input
                label="Company (Optional)"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.privacyConsent}
                    onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    I agree to the{' '}
                    <a href="/privacy-policy" className="text-brand-light-blue hover:underline" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>{' '}
                    *
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-red-600 text-sm ml-7">{errors.privacyConsent}</p>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    I consent to receive occasional marketing updates
                  </span>
                </label>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Access Sample Document'}
                </Button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-helvetica font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
