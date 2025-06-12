import { apiSlice } from './apiSlice';
import { Reaction, CreateReactionData } from '../../services/api/endpoints/reactions';
import { UUID } from 'crypto';

export const reactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addReaction: builder.mutation<
      Reaction, 
      { 
        workspaceUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        data: CreateReactionData 
      }
    >({
      query: ({ workspaceUuid, channelUuid, messageUuid, data }) => ({
        url: `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    addDirectMessageReaction: builder.mutation<
      Reaction, 
      { 
        userUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        data: CreateReactionData 
      }
    >({
      query: ({ userUuid, channelUuid, messageUuid, data }) => ({
        url: `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    removeReaction: builder.mutation<
      void, 
      { 
        workspaceUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        reactionUuid: UUID 
      }
    >({
      query: ({ workspaceUuid, channelUuid, messageUuid, reactionUuid }) => ({
        url: `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    removeDirectMessageReaction: builder.mutation<
      void, 
      { 
        userUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        reactionUuid: UUID 
      }
    >({
      query: ({ userUuid, channelUuid, messageUuid, reactionUuid }) => ({
        url: `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    getReactions: builder.query<
      Reaction[], 
      { 
        workspaceUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID 
      }
    >({
      query: ({ workspaceUuid, channelUuid, messageUuid }) => 
        `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
      providesTags: (result, error, { messageUuid }) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Reaction' as const, id: uuid })),
              { type: 'Reaction', id: `MESSAGE-${messageUuid}` },
            ]
          : [{ type: 'Reaction', id: `MESSAGE-${messageUuid}` }],
    }),
    
    getDirectMessageReactions: builder.query<
      Reaction[], 
      { 
        userUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID 
      }
    >({
      query: ({ userUuid, channelUuid, messageUuid }) => 
        `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
      providesTags: (result, error, { messageUuid }) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Reaction' as const, id: uuid })),
              { type: 'Reaction', id: `DIRECT-MESSAGE-${messageUuid}` },
            ]
          : [{ type: 'Reaction', id: `DIRECT-MESSAGE-${messageUuid}` }],
    }),
  }),
});

export const {
  useAddReactionMutation,
  useAddDirectMessageReactionMutation,
  useRemoveReactionMutation,
  useRemoveDirectMessageReactionMutation,
  useGetReactionsQuery,
  useGetDirectMessageReactionsQuery,
} = reactionsApi;
