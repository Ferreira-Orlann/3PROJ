import { apiSlice } from './apiSlice';
import { LoginCredentials, RegisterData, AuthResponse } from '../../services/api/endpoints/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.token) {
            await AsyncStorage.setItem('userToken', data.token);
          }
          
          if (data.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          }
        } catch (error) {
          console.error('Error storing auth data:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
      },
      invalidatesTags: ['Auth', 'User', 'Workspace', 'Channel', 'Message'],
    }),
    
    checkAuth: builder.query<AuthResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useCheckAuthQuery,
} = authApi;
