'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { deleteWebsiteImage, uploadWebsiteImage } from '@/app/actions/website-images'
import { publishArticleById } from '@/app/actions/publish-article'
import { saveArticleDraft } from '@/app/actions/save-article-draft'
import {
  ArticleLoader,
  type ArticleBlockKey,
  type ArticleContentBlock,
  type ArticleLoaderJson,
} from '@/app/components/ArticleLoader'

const BLOCK_TYPES_ALL: ArticleBlockKey[] = ['title', 'h1', 'h2', 'h3', 'p', 'img', 'vid', 'flicker']
const BLOCK_TYPES_ADDABLE: ArticleBlockKey[] = ['title', 'h1', 'h2', 'h3', 'p', 'vid', 'flicker']

type WebsiteImageItem = {
  path: string
  name: string
  publicUrl: string
  updatedAt: string
}

type Props = {
  articleId: string | number | null
  initialTitle: string
  initialTitleImage: string
  initialShortDescription: string
  initialBlocks: ArticleLoaderJson
  initialImageLibrary: WebsiteImageItem[]
}

function blockType(block: ArticleContentBlock): ArticleBlockKey {
  const k = Object.keys(block)[0] as ArticleBlockKey | undefined
  return k && BLOCK_TYPES_ALL.includes(k) ? k : 'p'
}

function blockValue(block: ArticleContentBlock): string {
  const key = blockType(block)
  return block[key] ?? ''
}

function emptyBlock(type: ArticleBlockKey): ArticleContentBlock {
  return { [type]: '' }
}

export function AdminArticleEditor({
  articleId,
  initialTitle,
  initialTitleImage,
  initialShortDescription,
  initialBlocks,
  initialImageLibrary,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isImagePending, startImageTransition] = useTransition()
  const [isPublishPending, startPublishTransition] = useTransition()
  const [title, setTitle] = useState(initialTitle)
  const [titleImage, setTitleImage] = useState(initialTitleImage)
  const [shortDescription, setShortDescription] = useState(initialShortDescription)
  const [blocks, setBlocks] = useState<ArticleLoaderJson>(initialBlocks)
  const [library, setLibrary] = useState<WebsiteImageItem[]>(initialImageLibrary)
  const [selectedLibraryPath, setSelectedLibraryPath] = useState(initialImageLibrary[0]?.path ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function addBlock(type: ArticleBlockKey) {
    setBlocks((prev) => [...prev, emptyBlock(type)])
  }

  function updateBlock(index: number, type: ArticleBlockKey, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { [type]: value } : b)))
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = prev.slice()
      const tmp = next[index]
      next[index] = next[target]
      next[target] = tmp
      return next
    })
  }

  function saveDraft() {
    setErrorMessage(null)
    setMessage(null)
    startTransition(async () => {
      const result = await saveArticleDraft({
        id: articleId,
        title,
        titleImage,
        shortDescription,
        article: blocks,
      })

      if ('error' in result && result.error) {
        setErrorMessage(result.error)
        return
      }

      setMessage('Draft saved.')
      router.push('/admin/articles')
      router.refresh()
    })
  }

  const selectedLibraryItem = useMemo(
    () => library.find((item) => item.path === selectedLibraryPath) ?? null,
    [library, selectedLibraryPath],
  )

  function addImageBlockFromLibrary() {
    if (!selectedLibraryItem) return
    setBlocks((prev) => [...prev, { img: selectedLibraryItem.publicUrl }])
    setMessage('Image block added from gallery.')
  }

  function setSelectedAsTitleImage() {
    if (!selectedLibraryItem) return
    setTitleImage(selectedLibraryItem.publicUrl)
    setMessage('Selected image set as title image.')
  }

  function uploadImage(file: File) {
    setErrorMessage(null)
    setMessage(null)
    startImageTransition(async () => {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadWebsiteImage(fd)
      if ('error' in result && result.error) {
        setErrorMessage(result.error)
        return
      }
      if ('success' in result && result.success) {
        const next: WebsiteImageItem = {
          path: result.path,
          name: result.path,
          publicUrl: result.publicUrl,
          updatedAt: new Date().toISOString(),
        }
        setLibrary((prev) => [next, ...prev])
        setSelectedLibraryPath(next.path)
        setMessage('Image uploaded.')
      }
      router.refresh()
    })
  }

  function deleteImage(path: string) {
    setErrorMessage(null)
    setMessage(null)
    startImageTransition(async () => {
      const result = await deleteWebsiteImage({ path })
      if ('error' in result && result.error) {
        setErrorMessage(result.error)
        return
      }
      setLibrary((prev) => prev.filter((item) => item.path !== path))
      setSelectedLibraryPath((prev) => (prev === path ? '' : prev))
      setMessage('Image deleted.')
      router.refresh()
    })
  }

  function publishNow() {
    setErrorMessage(null)
    setMessage(null)
    startPublishTransition(async () => {
      const saved = await saveArticleDraft({
        id: articleId,
        title,
        titleImage,
        shortDescription,
        article: blocks,
      })

      if ('error' in saved && saved.error) {
        setErrorMessage(saved.error)
        return
      }

      const idToPublish = saved.id ?? articleId
      if (idToPublish == null) {
        setErrorMessage('Could not resolve article id for publish.')
        return
      }

      const pub = await publishArticleById({ id: idToPublish })
      if ('error' in pub && pub.error) {
        setErrorMessage(pub.error)
        return
      }

      setMessage(`Published. Date set to ${pub.datePublished}.`)
      router.push('/admin/articles')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {articleId == null ? 'Create article draft' : `Edit article #${articleId}`}
        </h1>
        <Link
          href="/admin/articles"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Back to articles
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Article title"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-gray-600">Short description</span>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Upload new image</h2>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-gray-600">
            Upload to `website_images` bucket
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={isImagePending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              uploadImage(file)
              e.currentTarget.value = ''
            }}
            className="block text-sm"
          />
        </label>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Add article blocks</h2>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES_ADDABLE.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Block editor (top to bottom)</h2>
        {blocks.length === 0 ? (
          <p className="text-sm text-gray-500">No blocks added yet.</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((block, index) => {
              const type = blockType(block)
              const value = blockValue(block)
              return (
                <div key={`${type}-${index}`} className="rounded-md border border-gray-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <select
                      value={type}
                      onChange={(e) => updateBlock(index, e.target.value as ArticleBlockKey, value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                      {BLOCK_TYPES_ALL.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={value}
                    onChange={(e) => updateBlock(index, type, e.target.value)}
                    className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder={
                      type === 'vid'
                          ? 'YouTube URL'
                          : type === 'flicker'
                            ? 'Flickr embed URL'
                            : 'Text content'
                    }
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Image library (website_images)</h2>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1 space-y-1">
            <span className="block text-xs font-medium text-gray-600">Select uploaded image</span>
            <p className="text-xs text-gray-500">Click an image in the mini gallery below.</p>
          </div>

          <button
            type="button"
            disabled={!selectedLibraryItem || isImagePending}
            onClick={setSelectedAsTitleImage}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Set as title image
          </button>

          <button
            type="button"
            disabled={!selectedLibraryItem || isImagePending}
            onClick={addImageBlockFromLibrary}
            className="rounded-md border border-blue-300 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Add image tag to article
          </button>

          <button
            type="button"
            disabled={!selectedLibraryItem || isImagePending}
            onClick={() => {
              if (!selectedLibraryItem) return
              if (!window.confirm('Delete selected image from website_images bucket?')) return
              deleteImage(selectedLibraryItem.path)
            }}
            className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete selected image
          </button>
        </div>

        {library.length > 0 ? (
          <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200 p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {library.map((item) => {
                const active = selectedLibraryPath === item.path
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => setSelectedLibraryPath(item.path)}
                    className={`overflow-hidden rounded border text-left ${
                      active ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-200'
                    }`}
                    title={item.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.publicUrl}
                      alt={item.name}
                      className="h-20 w-full object-cover"
                    />
                    <div className="truncate px-1 py-1 text-[10px] text-gray-600">{item.name}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No images uploaded yet.</p>
        )}

        {selectedLibraryItem ? (
          <div className="rounded-md border border-gray-200 p-3">
            <p className="mb-1 text-xs font-medium text-gray-700">Selected image</p>
            <p className="break-all text-xs text-gray-600">{selectedLibraryItem.publicUrl}</p>
            {titleImage ? (
              <p className="mt-1 break-all text-xs text-gray-500">
                Current title image: {titleImage}
              </p>
            ) : null}
          </div>
        ) : null}

      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Live preview</h2>
        <ArticleLoader json={blocks} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveDraft}
          disabled={isPending || isPublishPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Saving draft...' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={publishNow}
          disabled={isPublishPending || isPending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isPublishPending ? 'Publishing...' : 'Publish now'}
        </button>
        <span className="text-xs text-gray-500">Status is always set to draft on save.</span>
      </div>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
    </div>
  )
}
