import apiClient from "../client";
import { UUID } from "crypto";

export interface FileUploadResponse {
  fileId: UUID;
}

export interface FileUploadRequest {
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

const filesService = {

  uploadFile: async (fileData: FileUploadRequest["file"]): Promise<UUID> => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: fileData.uri,
        name: fileData.name,
        type: fileData.type
      } as unknown as Blob);
      
      const response = await apiClient.post<string>("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      

      return response.data as unknown as UUID;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },
  

  getFileUrl: (fileId: UUID): string => {
    return `${apiClient.defaults.baseURL}/files/${fileId}`;
  }
};

export default filesService;
