import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API slice configuration
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      // If we have a token, add it to the headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    responseHandler: 'json', // Default response handler
  }),
  tagTypes: [
    'Auth', 
    'User', 
    'Workspace', 
    'Channel', 
    'Message', 
    'Member', 
    'Notification', 
    'Reaction', 
    'Attachment'
  ],
  endpoints: () => ({}),
});
