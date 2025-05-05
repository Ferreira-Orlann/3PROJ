import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#36393f",
    },
    mainContent: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2f3136",
        backgroundColor: "#36393f",
    },
    userInfo: {
        flexDirection: "column",
    },
    userNameContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff",
    },
    userStatus: {
        fontSize: 12,
        color: "#b9bbbe",
        marginTop: 2,
    },
    headerActions: {
        flexDirection: "row",
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: "#ffffff",
        marginBottom: 20,
        textAlign: "center",
    },
    errorText: {
        fontSize: 18,
        color: "#ff6b6b",
        marginBottom: 20,
        textAlign: "center",
    },
    backButton: {
        backgroundColor: "#7289da",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
    },
    backButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
});

export default styles;
