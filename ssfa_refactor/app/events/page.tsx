import { NewsListItem } from '../components/NewsListItem';

export default function Events() {
  const placeholderImage = "/placeholder-image.jpg"; // You might want to add a real placeholder image

  const newsItems = Array.from({ length: 10 }).map((_, index) => ({
    title: `Event Title ${index + 1}`,
    description: `This is a short description for event ${index + 1}. It provides a brief overview of what the event is about.`,
    date: `December ${20 - index}, 2025`,
    link: `/events/${index + 1}`,
    image: placeholderImage,
  }));

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <div className="grid gap-4 w-full md:w-3/4">
        {newsItems.slice(0, 9).map((item, index) => (
          <NewsListItem
            key={index}
            {...item}
            backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
          />
        ))}
        <div className="text-center mt-6">
          <a href="/events/archive" className="text-blue-600 hover:underline text-lg font-semibold">View All Events (Archive)</a>
        </div>
      </div>
    </div>
  );
}
