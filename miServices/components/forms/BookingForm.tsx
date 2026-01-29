'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import FileUpload from '@/components/ui/FileUpload';
import PropertySizeSelector from '@/components/ui/PropertySizeSelector';
import SuccessMessage from '@/components/ui/SuccessMessage';

interface PropertySize {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  postcode: string;
  jobType: string;
  propertySize: PropertySize;
  bookingDate: string;
  keysLocation: string;
  additionalInfo: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  postcode?: string;
  jobType?: string;
  propertySize?: string;
  bookingDate?: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    postcode: '',
    jobType: '',
    propertySize: {
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchens: 0,
    },
    bookingDate: '',
    keysLocation: '',
    additionalInfo: '',
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const jobTypeOptions = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'inventory-check-in', label: 'Inventory with Check-In' },
    { value: 'check-out', label: 'Check-Out' },
    { value: 'mid-term', label: 'Mid-Term' },
    { value: 'block-management', label: 'Block Management' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePropertySizeChange = (size: PropertySize) => {
    setFormData((prev) => ({ ...prev, propertySize: size }));
    if (errors.propertySize) {
      setErrors((prev) => ({ ...prev, propertySize: undefined }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact number is required';
    } else if (!/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    }

    if (!formData.jobType) {
      newErrors.jobType = 'Please select a job type';
    }

    const { bedrooms, bathrooms, livingRooms, kitchens } = formData.propertySize;
    if (bedrooms === 0 && bathrooms === 0 && livingRooms === 0 && kitchens === 0) {
      newErrors.propertySize = 'Please specify at least one room';
    }

    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Booking date and time is required';
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
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('company', formData.company);
      submitData.append('address', formData.address);
      submitData.append('postcode', formData.postcode);
      submitData.append('jobType', formData.jobType);
      submitData.append('propertySize', JSON.stringify(formData.propertySize));
      submitData.append('bookingDate', formData.bookingDate);
      submitData.append('keysLocation', formData.keysLocation);
      submitData.append('additionalInfo', formData.additionalInfo);

      if (uploadedFile) {
        submitData.append('file', uploadedFile);
      }

      const response = await fetch('/api/booking', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          company: '',
          address: '',
          postcode: '',
          jobType: '',
          propertySize: {
            bedrooms: 0,
            bathrooms: 0,
            livingRooms: 0,
            kitchens: 0,
          },
          bookingDate: '',
          keysLocation: '',
          additionalInfo: '',
        });
        setUploadedFile(null);
        setErrors({});
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('Failed to submit booking. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <SuccessMessage
        title="Booking Confirmed!"
        message="Your property report booking has been successfully submitted. Our team will contact you shortly to confirm the details."
        onClose={() => setSubmitSuccess(false)}
      />
    );
  }

  const showFileUpload = formData.jobType === 'check-out';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
        Customer Information
      </h2>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Contact Number"
          name="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />
      </div>

      <Input
        label="Company Name"
        name="company"
        type="text"
        value={formData.company}
        onChange={handleInputChange}
      />

      <hr className="my-8 border-gray-200" />

      <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
        Property Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Property Address"
            name="address"
            type="text"
            required
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
          />
        </div>
        <Input
          label="Postcode"
          name="postcode"
          type="text"
          required
          value={formData.postcode}
          onChange={handleInputChange}
          error={errors.postcode}
        />
      </div>

      <Select
        label="Job Type"
        name="jobType"
        required
        options={jobTypeOptions}
        value={formData.jobType}
        onChange={handleInputChange}
        error={errors.jobType}
      />

      <PropertySizeSelector
        value={formData.propertySize}
        onChange={handlePropertySizeChange}
        error={errors.propertySize}
      />

      <hr className="my-8 border-gray-200" />

      <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
        Booking Details
      </h2>

      <DatePicker
        label="Preferred Date & Time"
        name="bookingDate"
        required
        value={formData.bookingDate}
        onChange={handleInputChange}
        error={errors.bookingDate}
      />

      <Input
        label="Keys Location"
        name="keysLocation"
        type="text"
        placeholder="e.g., Collect from agent, At property, etc."
        value={formData.keysLocation}
        onChange={handleInputChange}
      />

      <Textarea
        label="Additional Information"
        name="additionalInfo"
        placeholder="Please include any notes, parking instructions, or special requirements"
        value={formData.additionalInfo}
        onChange={handleInputChange}
      />

      {showFileUpload && (
        <>
          <hr className="my-8 border-gray-200" />
          <h2 className="text-2xl font-helvetica font-bold text-brand-dark-blue mb-6">
            Upload Ingoing Inventory
          </h2>
          <FileUpload
            label="Upload Ingoing Inventory (optional)"
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={10485760}
            onChange={handleFileChange}
          />
        </>
      )}

      <div className="mt-8">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full"
        >
          Submit Booking
        </Button>
      </div>
    </form>
  );
}
