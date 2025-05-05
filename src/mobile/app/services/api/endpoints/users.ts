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
    fullName?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    avatar?: File;
    status?: "en ligne" | "absent" | "hors ligne";
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
        if (userData.avatar) {
            const formData = new FormData();

            Object.entries(userData).forEach(([key, value]) => {
                if (key === "avatar") {
                    formData.append("avatar", value);
                } else if (value !== undefined) {
                    formData.append(key, value.toString());
                }
            });

            const response = await apiClient.put<User>("/users", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }

        const response = await apiClient.put<User>("/users", userData);
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
