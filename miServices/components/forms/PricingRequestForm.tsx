'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function PricingRequestForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    territory: '',
    message: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

    if (!formData.territory.trim()) {
      newErrors.territory = 'Territory/Postcode is required';
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
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          territory: '',
          message: '',
          privacyConsent: false,
          marketingConsent: false,
        });
      } else {
        setErrors({ submit: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Helvetica, sans-serif' }}>
          Request Received!
        </h3>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Maitree, serif' }}>
          Thank you for your interest. We'll send your local price list to <strong>{formData.email}</strong> shortly — usually within the hour.
        </p>
        <Button onClick={() => setSubmitSuccess(false)}>
          Request Another Price List
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
      <h2 className="text-3xl font-bold text-[#3f59a9] mb-4" style={{ fontFamily: 'Helvetica, sans-serif' }}>
        Request Your Local Price List
      </h2>
      <p className="text-lg text-gray-700 mb-8" style={{ fontFamily: 'Maitree, serif' }}>
        Fill out the form and our team will send you the correct price list for your territory.<br />
        <span className="text-sm text-gray-600">(We respond quickly — usually within the hour.)</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
          />
        </div>

        <Input
          label="Company Name"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
        />

        <Input
          label="Territory / Postcode"
          required
          placeholder="e.g., M1 4AB or Manchester"
          value={formData.territory}
          onChange={(e) => handleChange('territory', e.target.value)}
          error={errors.territory}
        />

        <Textarea
          label="Message (Optional)"
          placeholder="Any additional information or questions..."
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={4}
        />

        <div className="space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.privacyConsent}
              onChange={(e) => handleChange('privacyConsent', e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-[#3f59a9] focus:ring-[#3f59a9] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700" style={{ fontFamily: 'Maitree, serif' }}>
              I agree to the <a href="/privacy-policy" className="text-[#157ec3] hover:underline">Privacy Policy</a> *
            </span>
          </label>
          {errors.privacyConsent && (
            <p className="text-red-600 text-sm ml-7">{errors.privacyConsent}</p>
          )}

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.marketingConsent}
              onChange={(e) => handleChange('marketingConsent', e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-[#3f59a9] focus:ring-[#3f59a9] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700" style={{ fontFamily: 'Maitree, serif' }}>
              I consent to receive occasional marketing updates
            </span>
          </label>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Sending...' : 'Request Price List'}
        </Button>
      </form>
    </div>
  );
}
