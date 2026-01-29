'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  reason: string;
  message: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  reason?: string;
  message?: string;
  privacyConsent?: string;
}

export default function ContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    reason: '',
    message: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const reasonOptions = [
    { value: 'quotes', label: 'Quotes' },
    { value: 'interested-in-services', label: 'Interested in Services' },
    { value: 'careers', label: 'Careers' },
    { value: 'book-a-job', label: 'Book A Job' },
    { value: 'support', label: 'Support' },
    { value: 'something-else', label: 'Something Else' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === 'reason' && value === 'book-a-job') {
      setShowBookingModal(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    if (!formData.reason) {
      newErrors.reason = 'Please select a reason for contact';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a message';
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.reason === 'book-a-job') {
      setShowBookingModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          reason: '',
          message: '',
          privacyConsent: false,
          marketingConsent: false,
        });
        setErrors({});
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToBooking = () => {
    router.push('/booking');
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
        <div className="text-green-600 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-helvetica font-bold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-gray-700 mb-6">
          Your message has been sent successfully. Our team will get back to you as soon as possible.
        </p>
        <Button onClick={() => setSubmitSuccess(false)} variant="primary">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
        />

        <Input
          label="Company Name"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
        />

        <Select
          label="Reason for Contact"
          name="reason"
          required
          options={reasonOptions}
          value={formData.reason}
          onChange={handleInputChange}
          error={errors.reason}
        />

        <Textarea
          label="Message"
          name="message"
          required
          placeholder="Please be as detailed as possible"
          value={formData.message}
          onChange={handleInputChange}
          error={errors.message}
        />

        <div className="mb-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleInputChange}
              className="mt-1 mr-2 h-4 w-4 text-brand-light-blue focus:ring-brand-light-blue border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/privacy-policy" className="text-brand-light-blue hover:underline">
                Privacy Policy
              </a>
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
          {errors.privacyConsent && (
            <p className="text-red-500 text-sm mt-1">{errors.privacyConsent}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleInputChange}
              className="mt-1 mr-2 h-4 w-4 text-brand-light-blue focus:ring-brand-light-blue border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              I consent to receive occasional marketing updates
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={formData.reason === 'book-a-job'}
          className="w-full"
        >
          {formData.reason === 'book-a-job' ? 'Please Use Booking Form' : 'Send Message'}
        </Button>
      </form>

      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book A Job"
      >
        <p className="text-gray-700 mb-6">
          To book a job, please use our Job Booking Form.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleGoToBooking} variant="primary" className="flex-1">
            Go to Booking Page
          </Button>
          <Button
            onClick={() => {
              setShowBookingModal(false);
              setFormData((prev) => ({ ...prev, reason: '' }));
            }}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
