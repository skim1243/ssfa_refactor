'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DonationData {
  // Personal Information - to be stored in user profile/backend
  name: string;
  date: string; // Current date, leave blank for now
  email: string;
  phone: string;
  occupation: string;

  // Address Information - to be stored with user profile/backend
  address: {
    street: string;
    city: string;
    zipCode: string;
  };

  // Donation Details - to be stored in donations table/backend
  amount: string;
}

interface FormErrors {
  // Personal Information errors
  name?: string;
  date?: string;
  email?: string;
  phone?: string;
  occupation?: string;

  // Address errors
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
  };

  // Donation Details errors
  amount?: string;
}

export default function DonateForm() {
  const router = useRouter();

  // State for form data - this would be sent to backend API endpoint
  const [formData, setFormData] = useState<DonationData>({
    name: '',
    date: '', // Current date, leave blank for now
    email: '',
    phone: '',
    occupation: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    },
    amount: ''
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

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Personal Information Validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';

    // Address Validation
    if (!formData.address.street.trim()) newErrors.address = { ...newErrors.address, street: 'Street address is required' };
    if (!formData.address.city.trim()) newErrors.address = { ...newErrors.address, city: 'City is required' };
    if (!formData.address.zipCode.trim()) newErrors.address = { ...newErrors.address, zipCode: 'ZIP code is required' };

    // Donation Amount Validation
    if (!formData.amount.trim()) newErrors.amount = 'Donation amount is required';

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
      // This is where you would send the donation data to your backend API
      // Example: await submitDonation(formData);
      // The backend should:
      // 1. Validate data server-side
      // 2. Process payment securely (using Stripe, PayPal API, etc.)
      // 3. Store donation record in database
      // 4. Send confirmation email

      console.log('Donation data to be sent to backend:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to homepage after successful submission
      router.push('/');

    } catch (error) {
      console.error('Donation submission error:', error);
      alert('There was an error processing your donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#20194A]">Make a Donation</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="Leave blank for current date"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
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
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Occupation *</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="Software Engineer"
              />
              {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Street *</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="123 Main Street"
              />
              {errors.address?.street && <p className="text-red-500 text-sm mt-1">{errors.address.street}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="New York"
              />
              {errors.address?.city && <p className="text-red-500 text-sm mt-1">{errors.address.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code *</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="10001"
              />
              {errors.address?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.address.zipCode}</p>}
            </div>
          </div>
        </div>

        {/* Donation Amount Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Donation Amount</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Amount *</label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              placeholder="Enter donation amount"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
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
            {isSubmitting ? 'Processing...' : 'Donate'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Your donation information will be securely processed.
          </p>
        </div>
      </form>
    </div>
  );
}
