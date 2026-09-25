'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function FranchiseProspectusForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    desiredTerritory: '',
    message: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

    if (!formData.desiredTerritory.trim()) {
      newErrors.desiredTerritory = 'Desired territory is required';
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'You must accept the privacy policy to continue';
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
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/franchise-prospectus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        desiredTerritory: '',
        message: '',
        privacyConsent: false,
        marketingConsent: false,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h3>
        <p className="text-green-700 text-lg mb-6">
          Your franchise prospectus request has been submitted successfully. We'll send you the information pack shortly and be in touch to discuss next steps.
        </p>
        <Button
          onClick={() => setSubmitStatus('idle')}
          className="bg-brand-light-blue text-white hover:bg-opacity-90"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={errors.firstName}
          required
        />

        <Input
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={errors.lastName}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
        />
      </div>

      <div className="mt-6">
        <Input
          label="Desired Territory (e.g. Manchester)"
          type="text"
          value={formData.desiredTerritory}
          onChange={(e) => handleChange('desiredTerritory', e.target.value)}
          error={errors.desiredTerritory}
          required
          placeholder="Enter your preferred location or postcode area"
        />
      </div>

      <div className="mt-6">
        <Textarea
          label="Message (Optional)"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={4}
          placeholder="Tell us about your background, experience, or any questions you have..."
        />
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacyConsent}
            onChange={(e) => handleChange('privacyConsent', e.target.checked)}
            className="mt-1 w-5 h-5 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/privacy-policy" className="text-brand-light-blue hover:underline">
              Privacy Policy
            </a>{' '}
            and consent to being contacted about franchise opportunities. *
          </span>
        </label>
        {errors.privacyConsent && (
          <p className="text-red-500 text-sm ml-8">{errors.privacyConsent}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(e) => handleChange('marketingConsent', e.target.checked)}
            className="mt-1 w-5 h-5 text-brand-light-blue border-gray-300 rounded focus:ring-brand-light-blue"
          />
          <span className="text-sm text-gray-700">
            I would like to receive marketing communications about franchise opportunities and business updates.
          </span>
        </label>
      </div>

      {submitStatus === 'error' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            There was an error submitting your request. Please try again or contact us directly.
          </p>
        </div>
      )}

      <div className="mt-8">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-light-blue text-white hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Download Prospectus'}
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-600 text-center">
        We'll send the prospectus to your email and follow up to discuss your franchise journey.
      </p>
    </form>
  );
}
