export type UserProfile = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    status: "En ligne" | "Absent" | "Ne pas déranger" | "Hors ligne";
    avatar?: string;
    avatarFile?: {
        uri: string;
        name: string;
        type: string;
    };
};

export type UserPreferences = {
    isDarkTheme: boolean;
};
export type OAuthConnections = {
    google: boolean;
    github: boolean;
    microsoft: boolean;
};


export type PasswordChangeInfo = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};
