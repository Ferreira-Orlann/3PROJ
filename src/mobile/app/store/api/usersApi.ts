import { apiSlice } from './apiSlice';
import { User, UpdateUserData } from '../../services/api/endpoints/users';
import { UUID } from 'crypto';

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    
    getUserById: builder.query<User, UUID>({
      query: (userId) => `/users/uuid/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    updateProfile: builder.mutation<User, UpdateUserData>({
      query: (userData) => {
        if (userData.avatar) {
          const formData = new FormData();
          
          Object.entries(userData).forEach(([key, value]) => {
            if (key === 'avatar') {
              formData.append('avatar', value as any);
            } else if (value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          
          return {
            url: '/users',
            method: 'PUT',
            body: formData,
            formData: true,
          };
        }
        
        return {
          url: '/users',
          method: 'PUT',
          body: userData,
        };
      },
      invalidatesTags: ['User'],
    }),
    
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: ({ currentPassword, newPassword }) => ({
        url: '/users',
        method: 'PUT',
        body: { currentPassword, newPassword },
      }),
    }),
    
    updateStatus: builder.mutation<User, User['status']>({
      query: (status) => ({
        url: '/users',
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['User'],
    }),
    
    searchUsers: builder.query<User[], string>({
      query: (query) => ({
        url: '/users',
        params: { query },
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateStatusMutation,
  useSearchUsersQuery,
} = usersApi;
