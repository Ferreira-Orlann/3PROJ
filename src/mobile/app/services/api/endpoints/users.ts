import apiClient from "../client";
import { UUID } from "crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
    status: "en ligne" | "absent" | "hors ligne";
    createdAt: string;
}

export interface UpdateUserData {
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    mdp?: string;
    currentPassword?: string;
    address?: string;
    avatar?: File | string;
    status?: "en ligne" | "absent" | "hors ligne";
    uuid?: string;
}

const userService = {
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await apiClient.get<User>("/users");

            console.log("User data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    },

    getUserById: async (userId: UUID): Promise<User> => {
        const response = await apiClient.get<User>(`/users/uuid/${userId}`);
        return response.data;
    },

    updateProfile: async (userData: UpdateUserData): Promise<User> => {
        // Get the user UUID
        const uuid = userData.uuid;
        if (!uuid) {
            throw new Error("UUID de l'utilisateur requis pour la mise à jour du profil");
        }
        
        const { uuid: _, ...dataToSend } = userData;
        
        if (dataToSend.avatar) {
            const formData = new FormData();

            Object.entries(dataToSend).forEach(([key, value]) => {
                if (key === "avatar") {
                    if (typeof value === 'object' && 'uri' in value) {
                        const imageFile = value as unknown as {
                            uri: string;
                            name: string;
                            type: string;
                        };
                        formData.append("avatar", {
                            uri: imageFile.uri,
                            name: imageFile.name,
                            type: imageFile.type
                        } as unknown as Blob);
                    } else {
                        formData.append("avatar", value.toString());
                    }
                } else if (value !== undefined && key !== "uuid") {
                    formData.append(key, value.toString());
                }
            });

            const response = await apiClient.put<User>(`/users/${uuid}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }

        const response = await apiClient.put<User>(`/users/${uuid}`, dataToSend);
        return response.data;
    },

    changePassword: async (
        currentPassword: string,
        newPassword: string,
    ): Promise<void> => {
        await apiClient.put("/users", {
            currentPassword,
            newPassword,
        });
    },

    updateStatus: async (status: User["status"]): Promise<User> => {
        const response = await apiClient.put<User>("/users", { status });
        return response.data;
    },

    searchUsers: async (query: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>("/users", {
            params: { query },
        });
        return response.data;
    },
};

export default userService;
