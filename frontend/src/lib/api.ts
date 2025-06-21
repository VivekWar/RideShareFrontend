import axios, { AxiosResponse } from 'axios';
import { User } from '@/types/user';
import { TOKEN_KEY } from '@/lib/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const register = async (userData: RegisterData): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to get user data');
  }
};

// Trip API functions
export interface Trip {
  id: number;
  driverId: number;
  from: string;
  to: string;
  departureTime: string;
  maxPassengers: number;
  currentPassengers: number;
  pricePerPerson: number;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  driver?: User;
  passengers?: User[];
}

export interface CreateTripData {
  from: string;
  to: string;
  departureTime: string;
  maxPassengers: number;
  pricePerPerson: number;
  description?: string;
}

export interface SearchTripsData {
  from?: string;
  to?: string;
  departureDate?: string;
  maxPrice?: number;
}

export const createTrip = async (tripData: CreateTripData): Promise<Trip> => {
  try {
    const response: AxiosResponse<Trip> = await api.post('/trips', tripData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create trip');
  }
};

export const getTrips = async (): Promise<Trip[]> => {
  try {
    console.log('🚀 Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}/trips`);
    console.log('🔑 Token present:', !!localStorage.getItem('token'));
    
    const response: AxiosResponse<Trip[]> = await api.get('/trips');
    console.log('✅ API Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Full Error Object:', error);
    console.error('❌ Error Response:', error.response);
    console.error('❌ Error Status:', error.response?.status);
    console.error('❌ Error Data:', error.response?.data);
    console.error('❌ Error Message:', error.message);
    
    // More specific error handling
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response?.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Check if backend is running.');
    } else {
      // Something else happened
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
};

export const getUserTrips = async (): Promise<Trip[]> => {
  try {
    const response: AxiosResponse<Trip[]> = await api.get('/users/trips');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch user trips');
  }
};

export const getTrip = async (id: number): Promise<Trip> => {
  try {
    const response: AxiosResponse<Trip> = await api.get(`/trips/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch trip');
  }
};

export const searchTrips = async (searchData: SearchTripsData): Promise<Trip[]> => {
  try {
    const response: AxiosResponse<Trip[]> = await api.post('/trips/search', searchData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to search trips');
  }
};

export const joinTrip = async (tripId: number): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await api.post(`/trips/${tripId}/join`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to join trip');
  }
};

export const updateTrip = async (id: number, tripData: Partial<CreateTripData>): Promise<Trip> => {
  try {
    const response: AxiosResponse<Trip> = await api.put(`/trips/${id}`, tripData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update trip');
  }
};

export const deleteTrip = async (id: number): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await api.delete(`/trips/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to delete trip');
  }
};

// User profile API functions
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await api.get('/users/profile');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch profile');
  }
};

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update profile');
  }
};