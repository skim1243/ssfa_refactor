import { notFound } from 'next/navigation';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  // In a real app, you would fetch the event data based on the ID
  // For now, we'll create some mock event data
  const eventId = parseInt(id);
  if (isNaN(eventId) || eventId < 1 || eventId > 10) {
    notFound();
  }

  const event = {
    id: eventId,
    title: `Event Title ${eventId}`,
    description: `This is a detailed description for event ${eventId}. It provides comprehensive information about what the event is about, when it will take place, and what participants can expect.`,
    date: `December ${20 - eventId + 1}, 2025`,
    time: '2:00 PM - 5:00 PM',
    location: 'Sejong Cultural Center',
    image: '/placeholder-image.jpg',
    fullDescription: `This is the full description for event ${eventId}. In a real application, this would contain all the detailed information about the event including schedule, requirements, contact information, and registration details.`
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Event Image Placeholder</span>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Details</h2>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quick Info</h2>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.fullDescription}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Register for Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
