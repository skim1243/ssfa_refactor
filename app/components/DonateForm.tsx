'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DonationData {
  name: string;
  date: string;
  address: string;
  amount: string;
  occupation: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  date?: string;
  address?: string;
  amount?: string;
  occupation?: string;
  phone?: string;
  email?: string;
}

export default function DonateForm() {
  const router = useRouter();

  // State for form data - this would be sent to backend API endpoint
  const [formData, setFormData] = useState<DonationData>({
    name: '',
    date: '',
    address: '',
    amount: '',
    occupation: '',
    phone: '',
    email: '',
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

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-yellow)]">Contribute by Credit Card / PayPal</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-yellow-50/60 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-yellow)]">Donation Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="123 Main Street, City, State ZIP"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="$100"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Occupation *</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="Software Engineer"
              />
              {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border-2 border-[var(--color-yellow)] text-gray-800 rounded-md focus:ring-2 focus:ring-[var(--color-yellow)] focus:border-transparent"
                placeholder="john.doe@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-4 text-white font-semibold rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[var(--color-yellow)] hover:bg-amber-500'
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
