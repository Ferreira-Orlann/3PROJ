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
    
    updateProfile: builder.mutation<User, UpdateUserData & { uuid?: string }>({
      query: (userData) => {
        console.log('updateProfile mutation called with data:', JSON.stringify(userData));
        
        const uuid = userData.uuid;
        if (!uuid) {
          console.error('User UUID is missing in updateProfile mutation');
          throw new Error('User UUID is required for updating profile');
        }
        
        console.log('Using UUID for profile update:', uuid);
        
        const { uuid: _, ...dataToSend } = userData;
        
        if (dataToSend.avatar) {
          console.log('Avatar detected in update data, creating FormData');
          const formData = new FormData();
          
          Object.entries(dataToSend).forEach(([key, value]) => {
            if (key === 'avatar') {
              if (typeof value === 'object' && 'uri' in value) {
                console.log('Adding File object to FormData:', key);
                formData.append('avatar', value as any);
              } else {
                console.log('Adding avatar UUID to FormData:', value);
                formData.append('avatar', value.toString());
              }
            } else if (value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          
          console.log('Sending PUT request to:', `/users/${uuid}`);
          return {
            url: `/users/${uuid}`,
            method: 'PUT',
            body: formData,
            formData: true,
          };
        }
        
        console.log('Sending regular JSON PUT request to:', `/users/${uuid}`);
        return {
          url: `/users/${uuid}`,
          method: 'PUT',
          body: dataToSend,
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
