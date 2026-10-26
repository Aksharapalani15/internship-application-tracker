/**
 * Centralized API Client
 * Configured with HTTP-only cookie credentials and error translation.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Universal request wrapper
 */
export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // If token is saved in localStorage (bearer fallback), add it
  const localToken = localStorage.getItem('internship_fallback_token');
  if (localToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${localToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Transmits and receives HTTP-only authentication cookies
  };

  try {
    const res = await fetch(url, config);

    // Handle CSV or text downloads
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/csv')) {
      if (!res.ok) {
        throw new ApiError('Failed to download CSV export', res.status);
      }
      return await res.text();
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      const errors = data?.errors || [];
      throw new ApiError(errorMsg, res.status, errors);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network errors (e.g. backend server is not running or CORS blocked)
    throw new ApiError(
      'Unable to connect to backend server. Please verify the server is running on http://localhost:5000.',
      0
    );
  }
}
