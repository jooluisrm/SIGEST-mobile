import React from "react";
import { 
    StyleSheet, 
    TextInput, 
    View, 
    Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    onAddPress: () => void;
    iconType?: "person" | "add";
};

export const SearchAddHeader = ({ 
    value, 
    onChangeText, 
    placeholder, 
    onAddPress,
    iconType = "add"
}: Props) => {
    return (
        <View style={styles.container}>
            {/* Search Bar Input Container */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {/* Add Action Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed
                ]}
                onPress={onAddPress}
            >
                <Ionicons 
                    name={iconType === "person" ? "person-add-outline" : "add-outline"} 
                    size={iconType === "person" ? 22 : 26} 
                    color="#ffffff" 
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        width: "100%",
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        height: 48,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 15,
        color: "#1f2937",
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: "#1D8C43", // Matching theme dark green
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    addButtonPressed: {
        backgroundColor: "#156731",
        opacity: 0.9,
    },
});
