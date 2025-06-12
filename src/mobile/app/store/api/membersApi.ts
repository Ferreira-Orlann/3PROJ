import { apiSlice } from './apiSlice';
import { Member, AddMemberData } from '../../services/api/endpoints/members';
import { UUID } from 'crypto';

export const membersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceMembers: builder.query<Member[], UUID>({
      query: (workspaceId) => `/workspaces/${workspaceId}/members`,
      providesTags: (result, error, workspaceId) => 
        result 
          ? [
              ...result.map(({ uuid }) => ({ type: 'Member' as const, id: uuid })),
              { type: 'Member', id: `WORKSPACE-${workspaceId}` },
            ]
          : [{ type: 'Member', id: `WORKSPACE-${workspaceId}` }],
    }),
    
    addMember: builder.mutation<Member, { workspaceId: UUID; memberData: AddMemberData }>({
      query: ({ workspaceId, memberData }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: 'POST',
        body: memberData,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Member', id: `WORKSPACE-${workspaceId}` },
        { type: 'Workspace', id: workspaceId }
      ],
    }),
    
    removeMember: builder.mutation<void, { workspaceId: UUID; memberId: UUID }>({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId, memberId }) => [
        { type: 'Member', id: memberId },
        { type: 'Member', id: `WORKSPACE-${workspaceId}` },
        { type: 'Workspace', id: workspaceId }
      ],
    }),
    
    updateMemberRole: builder.mutation<
      Member, 
      { 
        workspaceId: UUID; 
        memberId: UUID; 
        role: "admin" | "member" 
      }
    >({
      query: ({ workspaceId, memberId, role }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { workspaceId, memberId }) => [
        { type: 'Member', id: memberId },
        { type: 'Member', id: `WORKSPACE-${workspaceId}` }
      ],
    }),
  }),
});

export const {
  useGetWorkspaceMembersQuery,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} = membersApi;
