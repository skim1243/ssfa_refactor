import { Slideshow } from '../components/Slideshow';
import { NewsListItem } from '../app/components/NewsListItem';

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="h-[700px] w-full flex items-center justify-center bg-blue-200"><Slideshow /></div>
      <div className="h-[700px] w-full flex items-center justify-center bg-white text-black">Who are we</div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Our Impact</div>
      <div className="min-h-[700px] w-full flex flex-col items-center justify-center bg-white py-10">
        <h2 className="text-3xl font-bold mb-6 text-black">Recent News</h2>
        <div className="grid gap-4 w-full md:w-3/4">
          <NewsListItem
            title="First News Item"
            description="A brief description of the first news item."
            date="December 24, 2025"
            link="#"
            image="/placeholder-image.svg"
            backgroundColor="bg-white"
          />
          <NewsListItem
            title="Second News Item"
            description="Another brief description of the second news item."
            date="December 23, 2025"
            link="#"
            image="/placeholder-image.svg"
            backgroundColor="bg-gray-100"
          />
          <NewsListItem
            title="Third News Item"
            description="The third news item's description."
            date="December 22, 2025"
            link="#"
            image="/placeholder-image.svg"
            backgroundColor="bg-white"
          />
        </div>
      </div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Get Involved</div>
    </main>
  );
}
