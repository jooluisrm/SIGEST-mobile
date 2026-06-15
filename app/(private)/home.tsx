import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ButtonMenu } from "@/components/button-menu";
import { WelcomeCard } from "@/components/welcome-card";
import { ManagementBottomSheet } from "@/components/management-bottom-sheet";

export default function Home() {
    const [isManageSheetVisible, setIsManageSheetVisible] = useState(false);
    const router = useRouter();

    function handleManagePress() {
        setIsManageSheetVisible(true);
    }

    function handleSelectOption(optionId: string) {
        router.push({ pathname: `/(private)/gerenciar/${optionId}` as any });
    }

    return (
        <View style={styles.container}>
            <WelcomeCard />

            <View style={styles.gridOptions}>
                <ButtonMenu
                    title="Gerenciar"
                    iconSource={require("../../assets/cadastro-icon.png")}
                    onPress={handleManagePress}
                />
                <ButtonMenu
                    title="Frequência"
                    iconSource={require("../../assets/notas-frequencia-icon.png")}
                />
                <ButtonMenu
                    title="Relatórios"
                    iconSource={require("../../assets/relatorios-icon.png")}
                />
            </View>

            {/* Bottom Sheet Modal */}
            <ManagementBottomSheet
                visible={isManageSheetVisible}
                onClose={() => setIsManageSheetVisible(false)}
                onSelectOption={handleSelectOption}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 16,
        backgroundColor: "#f9fafb", // Light subtle background
    },
    gridOptions: {
        flexDirection: "column",
        flex: 1,
    }
});