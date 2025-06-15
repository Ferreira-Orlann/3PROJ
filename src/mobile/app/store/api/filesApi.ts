import { apiSlice } from './apiSlice';
import { UUID } from 'crypto';

export interface FileUploadRequest {
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

export const filesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UUID, FileUploadRequest['file']>({
      query: (fileData) => {
        const formData = new FormData();
        
        formData.append('file', {
          uri: fileData.uri,
          name: fileData.name,
          type: fileData.type
        } as unknown as Blob);
        
        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
          formData: true,
          responseHandler: (response) => response.text(), 
        };
      },
      
      transformResponse: (response: string) => {
        
        return response as unknown as UUID;
      },
    }),
    
    
    getFileUrl: builder.query<string, UUID>({
      queryFn: (fileId, _queryApi, _extraOptions, baseQuery) => {
        
        const baseUrl = baseQuery.baseUrl;
        return { data: `${baseUrl}/files/${fileId}` };
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFileUrlQuery,
  util: { getFileUrl },
} = filesApi;
