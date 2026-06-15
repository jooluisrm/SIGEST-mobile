import { Image, Pressable, StyleSheet, Text, ImageSourcePropType } from "react-native";

type Props = {
    title: string;
    iconSource: ImageSourcePropType;
    onPress?: () => void;
}

export const ButtonMenu = ({ title, iconSource, onPress }: Props) => {
    return (
        <Pressable style={styles.buttonContainer} onPress={onPress}>
            <Image
                source={iconSource}
                style={styles.buttonIcon}
                resizeMode="contain"
            />
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        backgroundColor: "#02456E",
        borderRadius: 16,
        paddingVertical: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 20,
    },
    buttonIcon: {
        width: 40,
        height: 40,
        marginLeft: 35,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    }
})