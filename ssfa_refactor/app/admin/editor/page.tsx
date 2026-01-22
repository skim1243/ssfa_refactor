'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ArticleContent {
  id: string;
  type: 'text' | 'image' | 'flickr';
  content: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  alt?: string;
  flickrId?: string;
}

interface ArticleData {
  id?: string;
  title: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  url: string;
  content: ArticleContent[];
  publishedAt: string | null;
  archivedAt: string | null;
}

export default function ArticleEditor() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    author: '',
    status: 'draft',
    url: '',
    content: [],
    publishedAt: null,
    archivedAt: null
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [availableImages] = useState<string[]>([
    '/SSFA-Logo.png',
    '/Content/img/John_Hwang_P.png',
    '/Content/img/King-Sejong-400x400.jpeg',
    '/placeholder-image.svg'
  ]);

  // Load article data if editing existing article
  useEffect(() => {
    if (articleId) {
      // TODO: Load article data from Supabase
      // For now, load placeholder data
      const existingArticle: ArticleData = {
        id: articleId,
        title: 'Sample Article',
        author: 'Admin',
        status: 'draft',
        url: '/articles/sample-article',
        content: [
          {
            id: '1',
            type: 'text',
            content: 'This is a sample article content.',
            size: 'medium'
          }
        ],
        publishedAt: null,
        archivedAt: null
      };
      setArticleData(existingArticle);
    }
  }, [articleId]);

  const addTextElement = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    const newElement: ArticleContent = {
      id: Date.now().toString(),
      type: 'text',
      content: 'Click to edit this text...',
      size
    };
    setArticleData(prev => ({
      ...prev,
      content: [...prev.content, newElement]
    }));
  };

  const addImageElement = (imageSrc: string) => {
    const newElement: ArticleContent = {
      id: Date.now().toString(),
      type: 'image',
      content: imageSrc,
      alt: 'Article image'
    };
    setArticleData(prev => ({
      ...prev,
      content: [...prev.content, newElement]
    }));
  };

  const addFlickrElement = () => {
    const newElement: ArticleContent = {
      id: Date.now().toString(),
      type: 'flickr',
      content: '',
      flickrId: ''
    };
    setArticleData(prev => ({
      ...prev,
      content: [...prev.content, newElement]
    }));
  };

  const updateElement = (id: string, updates: Partial<ArticleContent>) => {
    setArticleData(prev => ({
      ...prev,
      content: prev.content.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const deleteElement = (id: string) => {
    setArticleData(prev => ({
      ...prev,
      content: prev.content.filter(el => el.id !== id)
    }));
  };

  const generateUrl = (title: string) => {
    return '/articles/' + title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    const url = generateUrl(title);
    setArticleData(prev => ({
      ...prev,
      title,
      url
    }));
  };

  const saveArticle = () => {
    // TODO: Save to Supabase
    alert('Article saved as draft! (TODO: Implement Supabase integration)');
  };

  const publishArticle = () => {
    if (!articleData.title.trim() || !articleData.author.trim()) {
      alert('Please fill in title and author before publishing.');
      return;
    }

    const publishedArticle = {
      ...articleData,
      status: 'published' as const,
      publishedAt: new Date().toISOString()
    };

    setArticleData(publishedArticle);

    // TODO: Save to Supabase
    alert('Article published! (TODO: Implement Supabase integration)');
  };

  const getTextSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl font-bold';
      default: return 'text-base';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Tools */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Content Tools</h2>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Text Elements */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Text</h3>
            <div className="space-y-2">
              <button
                onClick={() => addTextElement('small')}
                className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Small Text
              </button>
              <button
                onClick={() => addTextElement('medium')}
                className="w-full text-left px-3 py-2 text-base bg-gray-100 hover:bg-gray-200 rounded"
              >
                Medium Text
              </button>
              <button
                onClick={() => addTextElement('large')}
                className="w-full text-left px-3 py-2 text-lg bg-gray-100 hover:bg-gray-200 rounded"
              >
                Large Text
              </button>
              <button
                onClick={() => addTextElement('xlarge')}
                className="w-full text-left px-3 py-2 text-xl font-bold bg-gray-100 hover:bg-gray-200 rounded"
              >
                Extra Large Text
              </button>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => addImageElement(image)}
                  className="aspect-square bg-gray-100 hover:bg-gray-200 rounded overflow-hidden"
                >
                  <img
                    src={image}
                    alt="Available image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Flickr */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Flickr</h3>
            <button
              onClick={addFlickrElement}
              className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              Add Flickr Photo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Article Preview */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {articleId ? 'Edit Article' : 'Create New Article'}
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={saveArticle}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Save Draft
            </button>
            <button
              onClick={publishArticle}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Publish Article
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Preview
            </button>
          </div>
        </div>

        {/* Article Preview */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Article Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {articleData.title || 'Article Title'}
            </h1>

            {/* Article Meta */}
            <div className="flex items-center text-gray-600 mb-8 pb-4 border-b border-gray-200">
              <span className="mr-4">By {articleData.author || 'Author'}</span>
              <span>Status: <span className={`px-2 py-1 text-xs rounded ${
                articleData.status === 'published' ? 'bg-green-100 text-green-800' :
                articleData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>{articleData.status}</span></span>
            </div>

            {/* Article Content */}
            <div className="space-y-6">
              {articleData.content.map((element) => (
                <div
                  key={element.id}
                  className={`cursor-pointer border-2 rounded p-4 ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === 'text' && (
                    <div
                      className={getTextSizeClass(element.size || 'medium')}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateElement(element.id, { content: e.currentTarget.textContent || '' })}
                    >
                      {element.content}
                    </div>
                  )}

                  {element.type === 'image' && (
                    <div className="text-center">
                      <img
                        src={element.content}
                        alt={element.alt}
                        className="max-w-full h-auto rounded shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={element.alt}
                        onChange={(e) => updateElement(element.id, { alt: e.target.value })}
                        className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm w-full"
                      />
                    </div>
                  )}

                  {element.type === 'flickr' && (
                    <div className="text-center">
                      <div className="bg-gray-200 rounded p-8 text-gray-600">
                        <p>Flickr Photo Embed</p>
                        <input
                          type="text"
                          placeholder="Flickr Photo ID"
                          value={element.flickrId}
                          onChange={(e) => updateElement(element.id, { flickrId: e.target.value })}
                          className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm w-full"
                        />
                        {element.flickrId && (
                          <div className="mt-4">
                            <img
                              src={`https://live.staticflickr.com/65535/${element.flickrId}_b.jpg`}
                              alt="Flickr photo"
                              className="max-w-full h-auto rounded shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedElement === element.id && (
                    <button
                      onClick={() => deleteElement(element.id)}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Delete Element
                    </button>
                  )}
                </div>
              ))}

              {articleData.content.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>Click on tools in the left sidebar to add content to your article.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Article Form */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Article Properties</h2>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={articleData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter article title"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={articleData.author}
              onChange={(e) => setArticleData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter author name"
            />
          </div>

          {/* Status (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                articleData.status === 'published' ? 'bg-green-100 text-green-800' :
                articleData.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {articleData.status.charAt(0).toUpperCase() + articleData.status.slice(1)}
              </span>
            </div>
          </div>

          {/* URL Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (Auto-generated)
            </label>
            <input
              type="text"
              value={articleData.url}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600"
            />
          </div>

          {/* Content Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Elements
            </label>
            <p className="text-sm text-gray-600">
              {articleData.content.length} element{articleData.content.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
