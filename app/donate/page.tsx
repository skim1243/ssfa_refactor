import DonateForm from '../components/DonateForm';

export default function Donate() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-yellow)] mb-4">Donate</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you. Your donation will make a difference. It is an investment in the future and the next generation.
          </p>
        </div>
        <DonateForm />
      </div>
    </main>
  );
}
