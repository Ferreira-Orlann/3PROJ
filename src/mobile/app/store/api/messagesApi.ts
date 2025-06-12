import { apiSlice } from './apiSlice';
import { Message, CreateMessageData } from '../../services/api/endpoints/messages';
import { UUID } from 'crypto';

export const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<Message[], { workspaceUuid: UUID; channelUuid: UUID }>({
      query: ({ workspaceUuid, channelUuid }) => 
        `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Message' as const, id: uuid })),
              { type: 'Message', id: 'LIST' },
            ]
          : [{ type: 'Message', id: 'LIST' }],
      
    }),
    
    
    getDirectMessages: builder.query<Message[], UUID>({
      query: (recipientUuid) => `/users/${recipientUuid}/messages`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Message' as const, id: uuid })),
              { type: 'Message', id: 'DIRECT_LIST' },
            ]
          : [{ type: 'Message', id: 'DIRECT_LIST' }],
    }),
    
    sendWorkspaceMessage: builder.mutation<
      Message, 
      { 
        workspaceUuid: UUID; 
        channelUuid: UUID; 
        messageData: CreateMessageData 
      }
    >({
      query: ({ workspaceUuid, channelUuid, messageData }) => ({
        url: `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`,
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),
    
    sendDirectMessage: builder.mutation<
      Message, 
      { 
        recipientUuid: UUID; 
        messageData: CreateMessageData 
      }
    >({
      query: ({ recipientUuid, messageData }) => ({
        url: `/users/${recipientUuid}/messages`,
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: [{ type: 'Message', id: 'DIRECT_LIST' }],
    }),
    
    editMessage: builder.mutation<
      Message, 
      { 
        workspaceUuid: UUID | null; 
        userUuid: UUID | null; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        content: string 
      }
    >({
      query: ({ workspaceUuid, userUuid, channelUuid, messageUuid, content }) => {
        let url;
        if (workspaceUuid) {
          url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        } else {
          url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        }
        
        return {
          url,
          method: 'PUT',
          body: { message: content },
        };
      },
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid },
        { type: 'Message', id: 'LIST' },
        { type: 'Message', id: 'DIRECT_LIST' }
      ],
    }),
    
    deleteMessage: builder.mutation<
      void, 
      { 
        workspaceUuid: UUID | null; 
        userUuid: UUID | null; 
        channelUuid: UUID; 
        messageUuid: UUID 
      }
    >({
      query: ({ workspaceUuid, userUuid, channelUuid, messageUuid }) => {
        let url;
        if (workspaceUuid) {
          url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        } else {
          url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        }
        
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid },
        { type: 'Message', id: 'LIST' },
        { type: 'Message', id: 'DIRECT_LIST' }
      ],
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useGetDirectMessagesQuery,
  useSendWorkspaceMessageMutation,
  useSendDirectMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = messagesApi;
