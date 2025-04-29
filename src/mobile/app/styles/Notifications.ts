import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1d21",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d32",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerButton: {
        marginLeft: 15,
    },
    list: {
        padding: 15,
    },
    notification: {
        flexDirection: "row",
        padding: 15,
        backgroundColor: "#2a2d32",
        borderRadius: 10,
        marginBottom: 10,
    },
    unread: {
        backgroundColor: "#2a2d32",
        borderLeftWidth: 3,
        borderLeftColor: "#9c5fff",
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#1a1d21",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    unreadIcon: {
        backgroundColor: "rgba(156, 95, 255, 0.1)",
    },
    content: {
        flex: 1,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    description: {
        color: "#666",
        fontSize: 14,
        marginBottom: 5,
    },
    timestamp: {
        color: "#666",
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        color: "#666",
        fontSize: 16,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#1a1d21",
        width: "90%",
        maxHeight: "80%",
        borderRadius: 10,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d32",
    },
    modalTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    modalScroll: {
        maxHeight: "80%",
    },
    preferenceSection: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d32",
    },
    sectionTitle: {
        color: "#9c5fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 15,
    },
    preferenceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    preferenceLabel: {
        color: "#fff",
        fontSize: 14,
    },
    channelPreference: {
        backgroundColor: "#2a2d32",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    channelName: {
        color: "#9c5fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: "#9c5fff",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        margin: 15,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default styles;
