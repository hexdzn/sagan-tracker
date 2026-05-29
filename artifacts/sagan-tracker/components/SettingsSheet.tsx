import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const { entries, events, importData } = useSagan();
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.stringify({ entries, events }, null, 2);
    const filename = `sagan-backup-${today}.json`;

    if (Platform.OS === "web") {
      try {
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch {
        Alert.alert("Export failed", "Could not download the file in this browser.");
      }
      return;
    }

    try {
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, data);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: "application/json" });
      } else {
        Alert.alert("Sharing not available", "Your device doesn't support file sharing.");
      }
    } catch {
      Alert.alert("Export failed", "Could not export data.");
    }
  };

  const handleImport = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            confirmImport(data);
          } catch {
            Alert.alert("Invalid file", "The selected file is not valid JSON.");
          }
        };
        reader.readAsText(file);
      };
      input.click();
      return;
    }

    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const text = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const data = JSON.parse(text);
        confirmImport(data);
      }
    } catch {
      Alert.alert("Import failed", "Could not read the selected file.");
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = (data: unknown) => {
    Alert.alert(
      "Replace all data?",
      "This will replace all your current data with the imported file. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: () => {
            try {
              const parsed = data as { entries?: unknown[]; events?: unknown[] };
              if (!Array.isArray(parsed.entries) || !Array.isArray(parsed.events)) {
                throw new Error("Invalid format");
              }
              importData({ entries: parsed.entries as never, events: parsed.events as never });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Import successful", "Your data has been restored.");
              onClose();
            } catch {
              Alert.alert("Invalid file", "The file format is not valid.");
            }
          },
        },
      ]
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Settings
        </Text>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          BACKUP & RESTORE
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleExport}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.receivedBg }]}>
            <Feather name="download" size={20} color={colors.received} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Export Data
            </Text>
            <Text style={[styles.actionDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Download a JSON backup of all entries and events
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1, marginTop: 10 },
          ]}
          onPress={handleImport}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.givenBg }]}>
            <Feather name="upload" size={20} color={colors.given} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Import Data
            </Text>
            <Text style={[styles.actionDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Restore from a previously exported backup
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>

        <View style={[styles.note, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Feather name="alert-circle" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Importing will replace all current data. Make sure to export a backup first.
          </Text>
        </View>

        <View style={{ height: 8 }} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 20, marginBottom: 24, marginTop: 4 },
  section: { fontSize: 11, letterSpacing: 0.8, marginBottom: 12 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, marginBottom: 2 },
  actionDesc: { fontSize: 13 },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginTop: 16,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
