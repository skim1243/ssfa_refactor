import React from 'react';

const ARIAL = 'Arial, sans-serif';
const BLACK = '#000000';

const textStyle = (fontSize: string, fontWeight: React.CSSProperties['fontWeight'] = 'normal') =>
  ({
    fontFamily: ARIAL,
    fontSize,
    fontWeight,
    color: BLACK,
    margin: '0 0 0.75em 0',
  }) as const;

const BLOCK_KEYS = ['title', 'h1', 'h2', 'h3', 'p', 'img', 'vid', 'flicker'] as const;
export type ArticleBlockKey = (typeof BLOCK_KEYS)[number];

/** One ordered segment: a single key among the allowed block types. */
export type ArticleContentBlock = {
  [K in ArticleBlockKey]?: string;
};

export type ArticleLoaderJson = ArticleContentBlock[];

function coerceBlockValueToString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const s = coerceBlockValueToString(item);
      if (s !== null) return s;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    const maybe = value as Record<string, unknown>;
    const directUrl = maybe.url ?? maybe.src ?? maybe.href ?? maybe.value;
    const s = coerceBlockValueToString(directUrl);
    if (s !== null) return s;
  }
  return null;
}

function normalizeArticleContentBlock(value: unknown): ArticleContentBlock | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = Object.keys(value as object).filter((k) =>
    BLOCK_KEYS.includes(k as ArticleBlockKey),
  );
  if (keys.length !== 1) return null;
  const key = keys[0] as ArticleBlockKey;
  const raw = (value as Record<string, unknown>)[key];
  const normalized = coerceBlockValueToString(raw);
  if (normalized === null) return null;
  return { [key]: normalized };
}

function normalizeArticleJson(data: unknown): ArticleLoaderJson | null {
  if (data === null || data === undefined) return null;
  let parsed: unknown = data;

  // `Articles.article` is text now; some rows may be stringified more than once.
  for (let i = 0; i < 3; i += 1) {
    if (typeof parsed !== 'string') break;
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsed)) return null;
  const blocks: ArticleContentBlock[] = [];
  for (const item of parsed) {
    const block = normalizeArticleContentBlock(item);
    if (block) blocks.push(block);
  }
  return blocks;
}

function getYouTubeEmbedSrc(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/embed/')) {
        return u.toString();
      }
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' && parts[1]) {
        return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
      }
      if (parts[0] === 'live' && parts[1]) {
        return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isAllowedFlickrSrc(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const h = u.hostname.replace(/^www\./, '');
    return h === 'flickr.com' || h.endsWith('.flickr.com') || h === 'embedr.flickr.com';
  } catch {
    return false;
  }
}

function encodeStoragePath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function resolveImageSrc(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return trimmed;

  if (trimmed.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${trimmed}`;
  }

  if (trimmed.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${trimmed}`;
  }

  if (trimmed.startsWith('/object/public/')) {
    return `${supabaseUrl}/storage/v1${trimmed}`;
  }

  if (trimmed.startsWith('object/public/')) {
    return `${supabaseUrl}/storage/v1/${trimmed}`;
  }

  if (trimmed.startsWith('website_images/')) {
    return `${supabaseUrl}/storage/v1/object/public/${encodeStoragePath(trimmed)}`;
  }

  // Treat non-URL values as object paths inside website_images bucket.
  return `${supabaseUrl}/storage/v1/object/public/website_images/${encodeStoragePath(trimmed)}`;
}

export interface ArticleLoaderProps {
  /** JSONB from Articles.article: ordered array of single-key blocks. */
  json: unknown;
  className?: string;
}

export const ArticleLoader: React.FC<ArticleLoaderProps> = ({ json, className }) => {
  const blocks = normalizeArticleJson(json);

  if (blocks === null) {
    return (
      <div className={className} style={{ fontFamily: ARIAL, fontSize: 12, color: BLACK }}>
        Article content must be a JSON array of blocks.
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className={className} style={{ fontFamily: ARIAL, fontSize: 12, color: BLACK }}>
        No displayable article blocks.
      </div>
    );
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const type = Object.keys(block).find((k) =>
          BLOCK_KEYS.includes(k as ArticleBlockKey),
        ) as ArticleBlockKey | undefined;
        if (!type) return null;
        const raw = block[type] ?? '';
        const key = `${type}-${index}`;

        switch (type) {
          case 'title':
            return (
              <div key={key} style={textStyle('32px', 'bold')}>
                {raw}
              </div>
            );
          case 'h1':
            return (
              <div key={key} style={textStyle('24px')}>
                {raw}
              </div>
            );
          case 'h2':
            return (
              <div key={key} style={textStyle('20px')}>
                {raw}
              </div>
            );
          case 'h3':
            return (
              <div key={key} style={textStyle('18px')}>
                {raw}
              </div>
            );
          case 'p':
            return (
              <p key={key} style={textStyle('12px')}>
                {raw}
              </p>
            );
          case 'img':
            if (!raw.trim()) {
              return (
                <p key={key} style={textStyle('12px')}>
                  Empty image source.
                </p>
              );
            }
            return (
              <div key={key} style={{ marginBottom: '0.75em' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageSrc(raw)}
                  alt=""
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            );
          case 'vid': {
            const embed = getYouTubeEmbedSrc(raw);
            if (!embed) {
              return (
                <p key={key} style={textStyle('12px')}>
                  Invalid YouTube link.
                </p>
              );
            }
            return (
              <div
                key={key}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 960,
                  marginBottom: '0.75em',
                  aspectRatio: '16 / 9',
                }}
              >
                <iframe
                  title="YouTube video"
                  src={embed}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                />
              </div>
            );
          }
          case 'flicker': {
            const src = raw.trim();
            if (!src || !isAllowedFlickrSrc(src)) {
              return (
                <p key={key} style={textStyle('12px')}>
                  Invalid Flickr embed link.
                </p>
              );
            }
            return (
              <div key={key} style={{ marginBottom: '0.75em', maxWidth: '100%' }}>
                <iframe
                  title="Flickr gallery"
                  src={src}
                  style={{
                    width: '100%',
                    minHeight: 420,
                    border: 0,
                  }}
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};
