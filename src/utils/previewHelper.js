// In-memory session cache so freshly converted files can be previewed instantaneously
// on any device without relying on ephemeral server disk storage or hardcoded localhost URLs.
const sessionPreviewCache = new Map();

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const saveSessionPreview = (key, data) => {
  if (!key) return;
  sessionPreviewCache.set(key, data);
};

export const getSessionPreview = (key) => {
  if (!key) return null;
  return sessionPreviewCache.get(key) || null;
};

export const resolveSafePreviewUrl = (rawUrl) => {
  if (!rawUrl) return '';
  const apiBase = getApiBaseUrl();
  const isLocalHostBrowser =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If the saved/returned URL points to localhost:3001 while the site is accessed remotely
  // (e.g. Vercel deployment or another device), rewrite it to the configured API base URL.
  if (!isLocalHostBrowser && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(rawUrl)) {
    if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiBase)) {
      return rawUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, apiBase.replace(/\/$/, ''));
    }
    return '';
  }

  return rawUrl;
};

