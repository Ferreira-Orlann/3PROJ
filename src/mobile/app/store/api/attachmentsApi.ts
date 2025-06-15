import { apiSlice } from './apiSlice';
import { Attachment } from '../../services/api/endpoints/attachments';
import { UUID } from 'crypto';

export const attachmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UUID, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
    }),
    
    getFile: builder.query<Blob, UUID>({
      query: (fileUuid) => `/files/${fileUuid}`,
      
      async transformResponse(response: Response) {
        return await response.blob();
      },
    }),
    
    attachFileToMessage: builder.mutation<
      void, 
      { 
        workspaceUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        fileUuid: UUID 
      }
    >({
      query: ({ workspaceUuid, channelUuid, messageUuid, fileUuid }) => ({
        url: `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
        method: 'POST',
        body: { fileUuid },
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    attachFileToDirectMessage: builder.mutation<
      void, 
      { 
        userUuid: UUID; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        fileUuid: UUID 
      }
    >({
      query: ({ userUuid, channelUuid, messageUuid, fileUuid }) => ({
        url: `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
        method: 'POST',
        body: { fileUuid },
      }),
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    removeAttachment: builder.mutation<
      void, 
      { 
        workspaceUuid: UUID | null; 
        userUuid: UUID | null; 
        channelUuid: UUID; 
        messageUuid: UUID; 
        fileUuid: UUID 
      }
    >({
      query: ({ workspaceUuid, userUuid, channelUuid, messageUuid, fileUuid }) => {
        let url;
        if (workspaceUuid) {
          url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
        } else {
          url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
        }
        
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result, error, { messageUuid }) => [
        { type: 'Message', id: messageUuid }
      ],
    }),
    
    uploadAndAttachFile: builder.mutation<
      UUID, 
      { 
        file: File; 
        workspaceUuid: UUID | null; 
        userUuid: UUID | null; 
        channelUuid: UUID; 
        messageUuid: UUID 
      }
    >({
      async onQueryStarted({ file, workspaceUuid, userUuid, channelUuid, messageUuid }, { dispatch, queryFulfilled }) {
        try {
        } catch (error) {
          console.error('Error uploading and attaching file:', error);
        }
      },
      query: () => ({ url: '', method: 'POST' }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFileQuery,
  useAttachFileToMessageMutation,
  useAttachFileToDirectMessageMutation,
  useRemoveAttachmentMutation,
} = attachmentsApi;
