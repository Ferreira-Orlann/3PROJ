import { apiSlice } from './apiSlice';
import { Notification } from '../../services/notifications';
import { UUID } from 'crypto';

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<Notification[], UUID>({
      query: (userUuid) => `/notifications/users/${userUuid}/notifications`,
      transformResponse: (response: any[]) => {
        // La transformation est déjà gérée dans le service d'API, mais nous pourrions
        // ajouter une transformation supplémentaire ici si nécessaire
        return response;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Notification' as const, id: uuid })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),
    
    getUnreadNotifications: builder.query<Notification[], UUID>({
      query: (userUuid) => `/notifications/users/${userUuid}/notifications/unread`,
      transformResponse: (response: any[]) => {
        // La transformation est déjà gérée dans le service d'API
        return response;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Notification' as const, id: uuid })),
              { type: 'Notification', id: 'UNREAD_LIST' },
            ]
          : [{ type: 'Notification', id: 'UNREAD_LIST' }],
    }),
    
    markAsRead: builder.mutation<void, { userUuid: UUID; notificationUuid: UUID }>({
      query: ({ userUuid, notificationUuid }) => ({
        url: `/notifications/users/${userUuid}/notifications/${notificationUuid}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { notificationUuid }) => [
        { type: 'Notification', id: notificationUuid },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_LIST' }
      ],
    }),
    
    markAllAsRead: builder.mutation<void, UUID>({
      query: (userUuid) => ({
        url: `/notifications/users/${userUuid}/notifications/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_LIST' }
      ],
    }),
    
    deleteNotification: builder.mutation<void, { userUuid: UUID; notificationUuid: UUID }>({
      query: ({ userUuid, notificationUuid }) => ({
        url: `/notifications/users/${userUuid}/notifications/${notificationUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { notificationUuid }) => [
        { type: 'Notification', id: notificationUuid },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_LIST' }
      ],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
