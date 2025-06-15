import apiClient from "../client";
import { UUID } from "crypto";
export interface Attachment {
    uuid: UUID;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
}

export interface AttachmentUploadData {
    file: File;
    messageUuid?: UUID;
}

const attachmentService = {
    uploadFile: async (file: File): Promise<UUID> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UUID>("/files/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },


    getFile: async (fileUuid: UUID): Promise<Blob> => {
        const response = await apiClient.get<Blob>(`/files/${fileUuid}`, {
            responseType: "blob",
        });
        return response.data;
    },

    getFileUrl: (fileUuid: UUID): string => {
        return `${apiClient.defaults.baseURL}/files/${fileUuid}`;
    },

    attachFileToMessage: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        fileUuid: UUID,
    ): Promise<void> => {
        await apiClient.post(
            `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
            { fileUuid },
        );
    },

        attachFileToDirectMessage: async (
        userUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        fileUuid: UUID,
    ): Promise<void> => {
        await apiClient.post(
            `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
            { fileUuid },
        );
    },

    removeAttachment: async (
        workspaceUuid: UUID | null,
        userUuid: UUID | null,
        channelUuid: UUID,
        messageUuid: UUID,
        fileUuid: UUID,
    ): Promise<void> => {
        let url;
        if (workspaceUuid) {
            url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
        } else {
            url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
        }

        await apiClient.delete(url);
    },

    uploadAndAttachFile: async (
        file: File,
        workspaceUuid: UUID | null,
        userUuid: UUID | null,
        channelUuid: UUID,
        messageUuid: UUID,
    ): Promise<UUID> => {
        const fileUuid = await attachmentService.uploadFile(file);

        if (workspaceUuid) {
            await attachmentService.attachFileToMessage(
                workspaceUuid,
                channelUuid,
                messageUuid,
                fileUuid,
            );
        } else if (userUuid) {
            await attachmentService.attachFileToDirectMessage(
                userUuid,
                channelUuid,
                messageUuid,
                fileUuid,
            );
        }

        return fileUuid;
    },
};

export default attachmentService;
