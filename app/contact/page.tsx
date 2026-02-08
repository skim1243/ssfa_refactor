import ContactForm from '../components/ContactForm';

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-[#20194A] mb-12">Contact Us</h1>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* How to Find Us Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-[#2B7FAD]">How to Find Us</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Phone</h3>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Location</h3>
                <p className="text-gray-600">
                  Sejong Cultural Center<br />
                  123 Main Street<br />
                  New York, NY 10001
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Office Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-[#2B7FAD]">Get in Touch</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
