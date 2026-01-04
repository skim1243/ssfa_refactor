import { NewsListItem } from '../../components/NewsListItem';

export default function EventsArchive() {
  const placeholderImage = "/placeholder-image.svg";

  // Create more events for the archive
  const allEvents = Array.from({ length: 25 }).map((_, index) => ({
    title: `Event Title ${index + 1}`,
    description: `This is a short description for event ${index + 1}. It provides a brief overview of what the event is about.`,
    date: `December ${20 - (index % 12)}, 202${4 + Math.floor(index / 12)}`,
    link: `/events/${index + 1}`,
    image: placeholderImage,
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Archive</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our complete collection of past and upcoming events. Find information about community gatherings,
          workshops, cultural celebrations, and more.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-4xl mx-auto">
        {allEvents.map((item, index) => (
          <NewsListItem
            key={index}
            {...item}
            backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          Can't find what you're looking for? <a href="/contact" className="text-blue-600 hover:underline">Contact us</a> for more information.
        </p>
      </div>
    </div>
  );
}
