import { apiSlice } from './apiSlice';
import { Channel, CreateChannelData } from '../../services/api/endpoints/channels';
import { UUID } from 'crypto';

export const channelsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<Channel[], void>({
      query: () => '/channels',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Channel' as const, id })),
              { type: 'Channel', id: 'LIST' },
            ]
          : [{ type: 'Channel', id: 'LIST' }],
    }),
    
    getChannelById: builder.query<Channel, UUID>({
      query: (channelId) => `/channels/${channelId}`,
      providesTags: (result, error, channelId) => [{ type: 'Channel', id: channelId }],
    }),
    
    createChannel: builder.mutation<Channel, CreateChannelData>({
      query: (channelData) => ({
        url: `/workspaces/${channelData.workspaceId}/channels`,
        method: 'POST',
        body: channelData,
      }),
      invalidatesTags: [{ type: 'Channel', id: 'LIST' }],
    }),
    
    updateChannel: builder.mutation<
      Channel, 
      { 
        workspaceId: UUID; 
        channelId: UUID; 
        channelData: Partial<Omit<CreateChannelData, 'workspaceId'>> 
      }
    >({
      query: ({ workspaceId, channelId, channelData }) => ({
        url: `/workspaces/${workspaceId}/channels/${channelId}`,
        method: 'PUT',
        body: channelData,
      }),
      invalidatesTags: (result, error, { channelId }) => [
        { type: 'Channel', id: channelId },
        { type: 'Channel', id: 'LIST' }
      ],
    }),
    
    deleteChannel: builder.mutation<void, UUID>({
      query: (channelId) => ({
        url: `/channels/${channelId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Channel', id: 'LIST' }],
    }),
    
    joinChannel: builder.mutation<void, UUID>({
      query: (channelId) => ({
        url: `/channels/${channelId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, channelId) => [
        { type: 'Channel', id: channelId },
        { type: 'Channel', id: 'LIST' }
      ],
    }),
    
    leaveChannel: builder.mutation<void, UUID>({
      query: (channelId) => ({
        url: `/channels/${channelId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, channelId) => [
        { type: 'Channel', id: channelId },
        { type: 'Channel', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetChannelByIdQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useJoinChannelMutation,
  useLeaveChannelMutation,
} = channelsApi;
