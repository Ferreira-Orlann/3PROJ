import apiClient from "../client";
import { UUID } from "crypto";

export interface Member {
    uuid: UUID;
    joinedAt: string;
    user: {
        uuid: UUID;
        username: string;
        firstname: string;
        lastname: string;
        email: string;
        mdp?: string;
        address?: string;
        status?: string;
        avatarUrl?: string;
    };
    workspace: {
        uuid: UUID;
        name: string;
        is_public: boolean;
        owner_uuid: UUID | null;
    };
}

export interface AddMemberData {
    userId: UUID;
    role?: "admin" | "member";
}


const memberService = {
    getWorkspaceMembers: async (workspaceId: UUID): Promise<Member[]> => {
        const response = await apiClient.get<Member[]>(
            `/workspaces/${workspaceId}/members`,
        );
        return response.data;
    },


    addMember: async (
        workspaceId: UUID,
        memberData: AddMemberData,
    ): Promise<Member> => {
        const response = await apiClient.post<Member>(
            `/workspaces/${workspaceId}/members`,
            memberData,
        );
        return response.data;
    },


    removeMember: async (workspaceId: UUID, memberId: UUID): Promise<void> => {
        await apiClient.delete(
            `/workspaces/${workspaceId}/members/${memberId}`,
        );
    },


    updateMemberRole: async (
        workspaceId: UUID,
        memberId: UUID,
        role: "admin" | "member",
    ): Promise<Member> => {
        const response = await apiClient.patch<Member>(
            `/workspaces/${workspaceId}/members/${memberId}`,
            { role },
        );
        return response.data;
    },
};

export default memberService;
