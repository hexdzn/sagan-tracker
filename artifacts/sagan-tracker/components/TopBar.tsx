import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";

export function TopBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setShowAddEntry, setShowSettings } = useSagan();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddEntry(true);
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSettings(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPad + 12,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
        Sagan Tracker
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <Feather name="plus" size={20} color="#fff" />
          </View>
        </Pressable>
        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1, marginLeft: 8 }]}
          hitSlop={8}
        >
          <Feather name="settings" size={22} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
