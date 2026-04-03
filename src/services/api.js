import axios from 'axios';
import { supabase } from '../utils/supabase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PUBLIC_GET_ROUTES = [
  /^\/events\/published$/,
  /^\/events\/[^/]+$/,
  /^\/announcements$/,
];

const isPublicRequest = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';

  return method === 'get' && PUBLIC_GET_ROUTES.some((pattern) => pattern.test(url));
};

const tryExtractAccessToken = (value) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed?.access_token === 'string') {
      return parsed.access_token;
    }

    if (typeof parsed?.currentSession?.access_token === 'string') {
      return parsed.currentSession.access_token;
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item?.access_token === 'string') {
          return item.access_token;
        }
      }
    }
  } catch (error) {
    return null;
  }

  return null;
};

const getStoredAccessToken = () => {
  if (typeof window === 'undefined') return null;

  const stores = [window.localStorage, window.sessionStorage];

  try {
    for (const store of stores) {
      for (let index = 0; index < store.length; index += 1) {
        const key = store.key(index);
        if (!key?.startsWith('sb-') || !key.includes('auth-token')) {
          continue;
        }

        const token = tryExtractAccessToken(store.getItem(key));
        if (token) {
          return token;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to read cached auth token:', error.message);
  }

  return null;
};

const getSessionWithTimeout = async () => (
  Promise.race([
    supabase.auth.getSession(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Session lookup timed out.')), 4000)),
  ])
);

// Interceptor to add Supabase token
api.interceptors.request.use(
  async (config) => {
    if (isPublicRequest(config)) {
      return config;
    }

    try {
      const cachedToken = getStoredAccessToken();
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        return config;
      }

      const { data: { session } } = await getSessionWithTimeout();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Protected request could not attach auth header:', error.message);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Handle unauthorized
    }

    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please verify the backend server is running.';
    }

    return Promise.reject(error);
  }
);

export default api;
