import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../services/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    responseHandler: 'json', 
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
