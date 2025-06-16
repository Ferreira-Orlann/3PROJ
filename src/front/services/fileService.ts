// src/services/file.service.ts
import authService from './auth.service';

export const fileService = {
  uploadFile: async (file: File): Promise<string> => {
    const token = authService.getSession().token;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:3000/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Important si le contrôleur est protégé
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi du fichier");
    }

    return await response.text(); // UUID renvoyé par le back
  },

  getFileUrl: (uuid: string): string => {
    return `http://localhost:3000/files/${uuid}`;
  }
};
