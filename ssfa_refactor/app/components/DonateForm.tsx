'use client';

import { useState } from 'react';

interface DonationData {
  // Personal Information - to be stored in user profile/backend
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Donation Details - to be stored in donations table/backend
  amount: number;
  isRecurring: boolean;
  frequency: 'monthly' | 'quarterly' | 'yearly' | null;
  isAnonymous: boolean;

  // Payment Information - sensitive data, handle securely/backend
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  cardNumber: string; // Store tokenized/encrypted in backend
  expiryMonth: string;
  expiryYear: string;
  cvv: string; // Never store in backend, only use for payment processing
  cardholderName: string;

  // Billing Address - to be stored with payment method/backend
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Additional Information
  comments: string;
  taxDeductible: boolean;
}

interface FormErrors {
  // Personal Information errors
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Donation Details errors
  amount?: string;
  isRecurring?: string;
  frequency?: string;
  isAnonymous?: string;

  // Payment Information errors
  paymentMethod?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;

  // Billing Address errors
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // Additional Information errors
  comments?: string;
  taxDeductible?: string;
}

export default function DonateForm() {
  // State for form data - this would be sent to backend API endpoint
  const [formData, setFormData] = useState<DonationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    amount: 0,
    isRecurring: false,
    frequency: null,
    isAnonymous: false,
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    comments: '',
    taxDeductible: true
  });

  // State for form validation and submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const presetAmounts = [25, 50, 100, 250, 500];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
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

    // Donation Amount Validation
    if (formData.amount <= 0) newErrors.amount = 'Please select or enter a donation amount';

    // Payment Validation
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors.cardNumber = 'Valid 16-digit card number required';
      }
      if (!formData.expiryMonth || !formData.expiryYear) {
        newErrors.expiryMonth = 'Expiry date required';
      }
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = 'Valid CVV required';
      }
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name required';
      }
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
      // 5. Handle recurring payments if applicable

      console.log('Donation data to be sent to backend:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Thank you for your donation! (This is a demo - actual payment processing not implemented)');

      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        amount: 0,
        isRecurring: false,
        frequency: null,
        isAnonymous: false,
        paymentMethod: 'credit_card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        comments: '',
        taxDeductible: true
      });

    } catch (error) {
      console.error('Donation submission error:', error);
      alert('There was an error processing your donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#20194A]">Make a Donation</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Personal Information</h3>
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
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Make this donation anonymous</span>
            </label>
          </div>
        </div>

        {/* Donation Amount Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Donation Amount</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleInputChange('amount', amount)}
                className={`p-3 border-2 rounded-md text-center font-medium transition-colors ${
                  formData.amount === amount
                    ? 'border-[#2B7FAD] bg-[#2B7FAD] text-white'
                    : 'border-gray-300 hover:border-[#2B7FAD]'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Other Amount</label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              placeholder="Enter custom amount"
              min="1"
              step="0.01"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Recurring Donation Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">Make this a recurring donation</span>
            </label>
            {formData.isRecurring && (
              <div className="ml-6 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={formData.frequency === 'monthly'}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Monthly</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="quarterly"
                    checked={formData.frequency === 'quarterly'}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Quarterly</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="yearly"
                    checked={formData.frequency === 'yearly'}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Yearly</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Payment Method</h3>
          <div className="space-y-3 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Credit/Debit Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">PayPal</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Bank Transfer</span>
            </label>
          </div>

          {/* Credit Card Details */}
          {formData.paymentMethod === 'credit_card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                  placeholder="John Doe"
                />
                {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Card Number *</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Month *</label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Year *</label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={String(new Date().getFullYear() + i)}>
                        {new Date().getFullYear() + i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV *</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                </div>
              </div>
              {errors.expiryMonth && <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>}
            </div>
          )}

          {/* PayPal Placeholder */}
          {formData.paymentMethod === 'paypal' && (
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                You will be redirected to PayPal to complete your donation securely.
              </p>
              {/* BACKEND INTEGRATION POINT: PayPal payment flow would be initiated here */}
            </div>
          )}

          {/* Bank Transfer Placeholder */}
          {formData.paymentMethod === 'bank_transfer' && (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Bank transfer instructions will be provided after form submission.
              </p>
              {/* BACKEND INTEGRATION POINT: Bank details would be provided here or via email */}
            </div>
          )}
        </div>

        {/* Billing Address Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={formData.billingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                value={formData.billingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code</label>
              <input
                type="text"
                value={formData.billingAddress.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                value={formData.billingAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="GBR">United Kingdom</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-[#2B7FAD]">Additional Information</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
                    className="w-full p-3 border-2 border-[#2B7FAD] text-[#2B7FAD] rounded-md focus:ring-2 focus:ring-[#2B7FAD] focus:border-transparent"
              rows={4}
              placeholder="Any special notes or dedication..."
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.taxDeductible}
                onChange={(e) => handleInputChange('taxDeductible', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">
                I understand this donation is tax-deductible to the extent allowed by law
              </span>
            </label>
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
            {isSubmitting ? 'Processing Donation...' : `Donate $${formData.amount || 0}`}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Your donation is secure and encrypted. We use industry-standard security measures.
          </p>
        </div>
      </form>
    </div>
  );
}
