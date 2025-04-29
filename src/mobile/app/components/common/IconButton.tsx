import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";

interface IconButtonProps {
    name: string;
    size?: number;
    color?: string;
    isActive?: boolean;
    onPress?: () => void;
    style?: any;
}

function IconButton({
    name,
    size = 24,
    color,
    isActive = false,
    onPress,
    style,
}: IconButtonProps) {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Ionicons
                name={name as any}
                size={size}
                color={color || (isActive ? Colors.primary : Colors.gray)}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
});

export default IconButton;
