export const MENU_ITEMS = [
    { icon: "chatbubbles", label: "Messages", route: "/messages" },
    { icon: "people", label: "Fichiers", route: "/fichiers" },
    { icon: "notifications", label: "Notifications", route: "/notifications" },
    { icon: "settings", label: "Paramètres", route: "/settings" },
] as const;

export const BOTTOM_TABS = [
    { path: "/", icon: "home", label: "Home" },
    { path: "/notifications", icon: "notifications", label: "Notifications" },
    { path: "/profils", icon: "person", label: "Profils" },
    { path: "/settings", icon: "settings", label: "Settings" },
] as const;

// Default export for navigation constants
const NavigationConstants = {
    MENU_ITEMS,
    BOTTOM_TABS,
};

export default NavigationConstants;
