import { apiSlice } from './apiSlice';
import { Workspace, CreateWorkspaceData, AddMemberWorkspaceData } from '../../services/api/endpoints/workspaces';
import { UUID } from 'crypto';

export const workspacesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => '/workspaces',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ workspaceId }) => ({ type: 'Workspace' as const, id: workspaceId })),
              { type: 'Workspace', id: 'LIST' },
            ]
          : [{ type: 'Workspace', id: 'LIST' }],
    }),
    
    getWorkspaceByUuid: builder.query<Workspace, UUID>({
      query: (uuid) => `/workspaces/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: 'Workspace', id: uuid }],
    }),
    
    createWorkspace: builder.mutation<Workspace, CreateWorkspaceData>({
      query: (workspaceData) => ({
        url: '/workspaces',
        method: 'POST',
        body: workspaceData,
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),
    
    updateWorkspace: builder.mutation<Workspace, { uuid: UUID; workspaceData: Partial<CreateWorkspaceData> }>({
      query: ({ uuid, workspaceData }) => ({
        url: `/workspaces/${uuid}`,
        method: 'PUT',
        body: workspaceData,
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: 'Workspace', id: uuid },
        { type: 'Workspace', id: 'LIST' }
      ],
    }),
    
    deleteWorkspace: builder.mutation<void, UUID>({
      query: (uuid) => ({
        url: `/workspaces/${uuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),
    
    joinWorkspace: builder.mutation<void, { uuid: UUID; memberData: AddMemberWorkspaceData }>({
      query: ({ uuid, memberData }) => ({
        url: `/workspaces/${uuid}/members`,
        method: 'POST',
        body: memberData,
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: 'Workspace', id: uuid },
        { type: 'Workspace', id: 'LIST' }
      ],
    }),
    
    leaveWorkspace: builder.mutation<void, UUID>({
      query: (uuid) => ({
        url: `/workspaces/${uuid}/members`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, uuid) => [
        { type: 'Workspace', id: uuid },
        { type: 'Workspace', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceByUuidQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useJoinWorkspaceMutation,
  useLeaveWorkspaceMutation,
} = workspacesApi;
