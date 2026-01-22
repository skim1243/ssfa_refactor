'use client';

import { useState, useEffect } from 'react';

interface ArchivedArticle {
  id: string;
  title: string;
  author: string;
  archived_at: string;
}

export default function ArchivePage() {
  const [archivedArticles, setArchivedArticles] = useState<ArchivedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedArticles();
  }, []);

  const fetchArchivedArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=archived');
      if (response.ok) {
        const data = await response.json();
        setArchivedArticles(data);
      }
    } catch (error) {
      console.error('Error fetching archived articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Archive</h1>
        <p className="text-gray-600 mt-2">
          View and manage archived articles.
        </p>
      </div>

      {/* Archive Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Archived Articles</h3>
          <p className="text-sm text-gray-600">Articles that have been archived</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archived Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Loading archived articles...
                  </td>
                </tr>
              ) : archivedArticles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No archived articles found
                  </td>
                </tr>
              ) : (
                archivedArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.archived_at ? new Date(article.archived_at).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
