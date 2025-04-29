import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { Colors } from "../../theme/colors";

const TABS = [
    {
        path: "/",
        icon: "home",
        label: "Home",
    },
    {
        path: "/notifications",
        icon: "notifications",
        label: "Notifications",
    },
    {
        path: "/profils",
        icon: "person",
        label: "Profils",
    },
    {
        path: "/settings",
        icon: "settings",
        label: "Settings",
    },
] as const;

export default function BottomBar() {
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const isActive =
                    pathname === tab.path ||
                    (pathname === "/" && tab.path === "/");
                return (
                    <Link key={tab.path} href={tab.path} asChild>
                        <TouchableOpacity style={styles.tab}>
                            <Ionicons
                                name={tab.icon as any}
                                size={24}
                                color={isActive ? Colors.primary : Colors.gray}
                            />
                        </TouchableOpacity>
                    </Link>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.bottomBar,
        borderTopWidth: 1,
        borderTopColor: "#2a2d32",
        flexDirection: "row",
        height: 70,
        paddingTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 5,
    },
    tab: {
        width: 100,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRightColor: "#2a2d32",
    },
});
