/**
 * API Client
 * Utilities for fetching data from the backend API
 */

import type { StatsResponse } from '@types/api';

// Default to localhost in development, can be overridden via env var
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetches bot statistics from the backend
 * @returns Promise with stats data
 */
export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}
