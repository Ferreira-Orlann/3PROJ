import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Liste d'emojis organisés par catégories
const EMOJI_DATA = {
    "Smileys & Emotion": [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "☹️",
        "😣",
        "😖",
        "😫",
        "😩",
        "🥺",
        "😢",
        "😭",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
    ],
    "People & Body": [
        "👍",
        "👎",
        "👊",
        "✊",
        "🤛",
        "🤜",
        "🤞",
        "✌️",
        "🤟",
        "🤘",
        "👌",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
        "✋",
        "🤚",
        "🖐",
        "🖖",
        "👋",
        "🤙",
        "💪",
        "🖕",
        "✍️",
        "🙏",
        "🦶",
        "🦵",
        "💄",
        "💋",
    ],
    "Animals & Nature": [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐸",
        "🐵",
        "🙈",
        "🙉",
        "🙊",
        "🐒",
        "🐔",
    ],
    "Food & Drink": [
        "🍏",
        "🍎",
        "🍐",
        "🍊",
        "🍋",
        "🍌",
        "🍉",
        "🍇",
        "🍓",
        "🍈",
        "🍒",
        "🍑",
        "🥭",
        "🍍",
        "🥥",
        "🥝",
        "🍅",
        "🍆",
        "🥑",
        "🥦",
    ],
    Activities: [
        "⚽️",
        "🏀",
        "🏈",
        "⚾️",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🥅",
        "⛳️",
        "🏹",
        "🎣",
    ],
    "Travel & Places": [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🚚",
        "🚛",
        "🚜",
        "🛴",
        "🚲",
        "🛵",
        "🏍",
        "🚨",
        "🚔",
        "🚍",
    ],
    Objects: [
        "⌚️",
        "📱",
        "📲",
        "💻",
        "⌨️",
        "🖥",
        "🖨",
        "🖱",
        "🖲",
        "🕹",
        "🗜",
        "💽",
        "💾",
        "💿",
        "📀",
        "📼",
        "📷",
        "📸",
        "📹",
        "🎥",
    ],
    Symbols: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
    ],
    Flags: [
        "🏳️",
        "🏴",
        "🏁",
        "🚩",
        "🏳️‍🌈",
        "🇦🇫",
        "🇦🇽",
        "🇦🇱",
        "🇩🇿",
        "🇦🇸",
        "🇦🇩",
        "🇦🇴",
        "🇦🇮",
        "🇦🇶",
        "🇦🇬",
        "🇦🇷",
        "🇦🇲",
        "🇦🇼",
        "🇦🇺",
        "🇦🇹",
    ],
};

// Convertir les données en format pour FlatList
const CATEGORIES = Object.keys(EMOJI_DATA);
const ALL_EMOJIS = Object.values(EMOJI_DATA).flat();

interface EmojiPickerProps {
    onEmojiSelected: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
    onEmojiSelected,
    onClose,
}) => {
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

    const screenWidth = Dimensions.get("window").width;
    const numColumns = Math.floor(screenWidth / 45); // Ajustez selon la taille d'emoji souhaitée

    // Filtrer les emojis en fonction de la recherche
    const filteredEmojis = searchText.trim()
        ? ALL_EMOJIS.filter((emoji) => emoji.includes(searchText))
        : EMOJI_DATA[selectedCategory as keyof typeof EMOJI_DATA];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Emojis</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color="#8e9297"
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un emoji..."
                    placeholderTextColor="#8e9297"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>
            <View>
                {!searchText.trim() && (
                    <FlatList
                        horizontal
                        data={CATEGORIES}
                        keyExtractor={(item) => item}
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === item &&
                                        styles.selectedCategory,
                                ]}
                                onPress={() => setSelectedCategory(item)}
                            >
                                <Text style={styles.categoryText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>

            <FlatList
                data={filteredEmojis}
                keyExtractor={(item, index) => `${item}-${index}`}
                numColumns={numColumns}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.emojiButton}
                        onPress={() => onEmojiSelected(item)}
                    >
                        <Text style={styles.emoji}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#2f3136",
        borderTopWidth: 1,
        borderTopColor: "#202225",
        maxHeight: 350,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#202225",
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#40444b",
        margin: 10,
        borderRadius: 4,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: "#dcddde",
        fontSize: 14,
    },
    categoriesList: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#202225",
    },
    categoryButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 4,
    },
    selectedCategory: {
        backgroundColor: "#40444b",
    },
    categoryText: {
        color: "#dcddde",
        fontSize: 12,
    },
    emojiButton: {
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    emoji: {
        fontSize: 24,
    },
});

export default EmojiPicker;
