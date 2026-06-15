import { Tabs } from "expo-router";
import { Image, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PrivateLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#52B28B' }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Início",
                    headerStyle: {
                        backgroundColor: "#52B28B",
                    },
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Image
                            source={require("../../assets/sigest-logo.png")}
                            style={{ width: 100, height: 38, resizeMode: "contain", marginLeft: 16 }}
                        />
                    ),
                    headerRight: () => (
                        <Pressable style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
                            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600", marginRight: 8 }}>
                                Fulano
                            </Text>
                            <Ionicons name="person-circle" size={30} color="#ffffff" />
                        </Pressable>
                    )
                }}

            />
        </Tabs>
    );
}
