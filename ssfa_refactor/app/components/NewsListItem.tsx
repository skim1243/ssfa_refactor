import Image from 'next/image';
import Link from 'next/link';

interface NewsListItemProps {
  title: string;
  description: string;
  date: string;
  link: string;
  image: string;
  backgroundColor: string;
}

export const NewsListItem: React.FC<NewsListItemProps> = ({
  title,
  description,
  date,
  link,
  image,
  backgroundColor,
}) => {
  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center p-4 rounded-lg shadow-md ${backgroundColor}`}>
      <div className="w-full md:w-1/4 pr-4 mb-4 md:mb-0">
        <Link href={link}>
          <Image src={image} alt={title} width={200} height={150} layout="responsive" objectFit="cover" />
        </Link>
      </div>
      <div className="w-full md:w-3/4">
        <h3 className="text-lg font-bold mb-1">
          <Link href={link} className="hover:underline">
            {title}
          </Link>
        </h3>
        <p className="text-gray-700 text-sm mb-1">{description}</p>
        <p className="text-gray-500 text-xs">{date}</p>
      </div>
    </div>
  );
};

