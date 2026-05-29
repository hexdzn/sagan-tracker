import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { AddEntrySheet } from "@/components/AddEntrySheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  const { showAddEntry, setShowAddEntry, showSettings, setShowSettings } = useSagan();
  return (
    <>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Icon sf={{ default: "house", selected: "house.fill" }} />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="events">
          <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
          <Label>Events</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="log">
          <Icon sf={{ default: "list.bullet", selected: "list.bullet" }} />
          <Label>Log</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="people">
          <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
          <Label>People</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
      <AddEntrySheet />
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { showSettings, setShowSettings } = useSagan();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.background,
            borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
            ...(isWeb ? { height: 84 } : {}),
          },
          tabBarLabelStyle: {
            fontFamily: "Inter_500Medium",
            fontSize: 11,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : isWeb ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="house" tintColor={color} size={24} />
              ) : (
                <Feather name="home" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="calendar" tintColor={color} size={24} />
              ) : (
                <Feather name="calendar" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: "Log",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="list.bullet" tintColor={color} size={24} />
              ) : (
                <Feather name="list" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: "People",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="person.2" tintColor={color} size={24} />
              ) : (
                <Feather name="users" size={22} color={color} />
              ),
          }}
        />
      </Tabs>
      <AddEntrySheet />
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
