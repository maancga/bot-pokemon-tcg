/**
 * API Types
 * Type definitions for backend API responses
 */

export interface Store {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Integration {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'maintenance';
  icon: string;
}

export interface StatsResponse {
  stores: {
    total: number;
    active: Store[];
  };
  integrations: Integration[];
}
