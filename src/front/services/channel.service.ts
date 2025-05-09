// src/front/services/channel.service.ts
import axios from "axios";
import authService from "./auth.service";

const API_URL = "http://localhost:3000";

export interface CreateChannelDto {
    name: string;
    workspaceUuid: string;
}

export const channelService = {
    async create(dto: CreateChannelDto) {
        const token = authService.getSession().token;

        const response = await axios.post(
            `${API_URL}/workspaces/${dto.workspaceUuid}/channels`,
            dto,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    },
};
