import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";
import { Entry } from "@/types";

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}

function formatAmount(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

interface Props {
  entry: Entry;
  eventName?: string;
  showDelete?: boolean;
}

export function EntryCard({ entry, eventName, showDelete = true }: Props) {
  const colors = useColors();
  const { deleteEntry } = useSagan();
  const [expanded, setExpanded] = useState(false);
  const isReceived = entry.type === "received";

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteEntry(entry.id);
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isReceived ? colors.receivedBg : colors.givenBg },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isReceived ? colors.received : colors.given, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {isReceived ? "Received" : "Given"}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
              {entry.personName}
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              {entry.relationshipTag} · {entry.occasion}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              { color: isReceived ? colors.received : colors.given, fontFamily: "Inter_700Bold" },
            ]}
          >
            {formatAmount(entry.amount)}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDate(entry.date)}
          </Text>
        </View>
      </View>

      {eventName && (
        <View style={[styles.eventPill, { backgroundColor: colors.muted }]}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.eventPillText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {eventName}
          </Text>
        </View>
      )}

      {expanded && (
        <View style={[styles.expandedArea, { borderTopColor: colors.border }]}>
          {entry.notes ? (
            <Text style={[styles.notes, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {entry.notes}
            </Text>
          ) : (
            <Text style={[styles.notes, { color: colors.border, fontFamily: "Inter_400Regular" }]}>
              No notes
            </Text>
          )}
          {showDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                { backgroundColor: colors.negativeBg, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="trash-2" size={14} color={colors.destructive} />
              <Text style={[styles.deleteBtnText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
                Delete
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11 },
  name: { fontSize: 15, marginBottom: 2 },
  sub: { fontSize: 12 },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 16, marginBottom: 2 },
  date: { fontSize: 11 },
  eventPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  eventPillText: { fontSize: 11 },
  expandedArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 12,
  },
  notes: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  deleteBtnText: { fontSize: 13 },
});
