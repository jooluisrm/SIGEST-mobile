import { Tabs } from "expo-router";
import { Image, Pressable, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

export default function PrivateLayout() {
    const { user, signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Sair",
            "Deseja realmente sair da sua conta?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: signOut }
            ]
        );
    };

    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#52B28B', tabBarStyle: { display: 'none' } }}>
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
                        <Pressable 
                            onPress={handleLogout}
                            style={({ pressed }) => [
                                { flexDirection: "row", alignItems: "center", marginRight: 16 },
                                pressed && { opacity: 0.7 }
                            ]}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600", marginRight: 8 }}>
                                {user?.nome ? user.nome.split(" ")[0] : "Usuário"}
                            </Text>
                            <Ionicons name="person-circle" size={30} color="#ffffff" />
                        </Pressable>
                    )
                }}

            />
            
            {/* Oculta as telas de gerenciamento das abas inferiores */}
            <Tabs.Screen
                name="gerenciar"
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
            
            {/* Oculta as telas de frequencia das abas inferiores */}
            <Tabs.Screen
                name="frequencia"
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}

