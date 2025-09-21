// API configuration utility
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getApiUrl(path: string): string {
  // In development or when VITE_API_URL is not set, use relative URLs
  if (!API_BASE_URL || import.meta.env.DEV) {
    return path;
  }
  
  // In production, use the full API URL
  return `${API_BASE_URL}${path}`;
}

export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};