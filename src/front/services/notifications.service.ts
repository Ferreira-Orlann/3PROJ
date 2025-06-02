import authService from './auth.service';

const baseUrl = "http://localhost:3000/notifications";

const notificationsService = {
  getUserNotifications: async (userUuid: string) => {
    const token = authService.getSession().token;
    const response = await fetch(`${baseUrl}/users/${userUuid}/notifications`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des notifications");
    }

    return await response.json();
  },
};

export default notificationsService;
