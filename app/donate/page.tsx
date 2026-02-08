import DonateForm from '../components/DonateForm';

export default function Donate() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#20194A] mb-4">Support Our Mission</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your generous donation helps us continue our work in supporting families and communities.
            Every contribution, no matter the size, makes a meaningful difference.
          </p>
        </div>
        <DonateForm />
      </div>
    </main>
  );
}
