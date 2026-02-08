'use client';

import { useState } from 'react';

interface ContactData {
  // Personal Information - to be stored in contact messages/backend
  firstName: string;
  lastName: string;
  email: string;

  // Message Details - to be stored in contact messages table/backend
  message: string;
}

interface FormErrors {
  // Personal Information errors
  firstName?: string;
  lastName?: string;
  email?: string;

  // Message errors
  message?: string;
}

export default function ContactForm() {
  // State for form data - this would be sent to backend API endpoint
  const [formData, setFormData] = useState<ContactData>({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  // State for form validation and submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Personal Information Validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    // Message Validation
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // BACKEND INTEGRATION POINT:
      // This is where you would send the contact data to your backend API
      // Example: await submitContactMessage(formData);
      // The backend should:
      // 1. Validate data server-side
      // 2. Store contact message in database
      // 3. Send confirmation email to user
      // 4. Send notification email to organization staff
      // 5. Handle any spam prevention measures

      console.log('Contact data to be sent to backend:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Thank you for your message! We will get back to you soon.');

      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });

    } catch (error) {
      console.error('Contact submission error:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
            placeholder="john.doe@email.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message *</label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
            rows={6}
            placeholder="Please enter your message here..."
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-8 py-4 text-white font-semibold rounded-lg transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#2B7FAD] hover:bg-[#256a92]'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          We typically respond within 24-48 hours.
        </p>
      </div>
    </form>
  );
}
