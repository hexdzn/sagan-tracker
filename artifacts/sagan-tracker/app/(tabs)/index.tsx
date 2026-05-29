import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EntryCard } from "@/components/EntryCard";
import { TopBar } from "@/components/TopBar";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number): string {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, events } = useSagan();

  const stats = useMemo(() => {
    const totalReceived = entries
      .filter((e) => e.type === "received")
      .reduce((s, e) => s + e.amount, 0);
    const totalGiven = entries
      .filter((e) => e.type === "given")
      .reduce((s, e) => s + e.amount, 0);
    const net = totalReceived - totalGiven;
    const people = new Set(entries.map((e) => e.personName.toLowerCase())).size;
    return { totalReceived, totalGiven, net, people };
  }, [entries]);

  const recentEntries = useMemo(() => entries.slice(0, 3), [entries]);

  const eventMap = useMemo(
    () => Object.fromEntries(events.map((ev) => [ev.id, ev.name])),
    [events]
  );

  const bottomPad =
    Platform.OS === "web" ? 34 : insets.bottom + (Platform.OS === "ios" ? 84 : 70);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#E8851A" }]}>
            <Feather name="arrow-down-circle" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.statLabel, { fontFamily: "Inter_500Medium" }]}>Total Received</Text>
            <Text style={[styles.statAmount, { fontFamily: "Inter_700Bold" }]}>
              {formatAmount(stats.totalReceived)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#2D8A4E" }]}>
            <Feather name="arrow-up-circle" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.statLabel, { fontFamily: "Inter_500Medium" }]}>Total Given</Text>
            <Text style={[styles.statAmount, { fontFamily: "Inter_700Bold" }]}>
              {formatAmount(stats.totalGiven)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.netCard,
            {
              backgroundColor: stats.net >= 0 ? colors.positiveBg : colors.negativeBg,
              borderColor: stats.net >= 0 ? "#2D8A4E" : "#CC3333",
            },
          ]}
        >
          <View style={styles.netLeft}>
            <Feather
              name="activity"
              size={16}
              color={stats.net >= 0 ? colors.received : colors.negative}
            />
            <Text
              style={[
                styles.netLabel,
                { color: stats.net >= 0 ? colors.received : colors.negative, fontFamily: "Inter_500Medium" },
              ]}
            >
              Net Balance
            </Text>
          </View>
          <Text
            style={[
              styles.netAmount,
              {
                color: stats.net >= 0 ? colors.received : colors.negative,
                fontFamily: "Inter_700Bold",
              },
            ]}
          >
            {stats.net >= 0 ? "+" : "-"}
            {formatAmount(stats.net)}
          </Text>
        </View>

        <View style={styles.pillsRow}>
          <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {entries.length}
            </Text>
            <Text style={[styles.pillLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Entries
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {stats.people}
            </Text>
            <Text style={[styles.pillLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              People
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pillNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {events.length}
            </Text>
            <Text style={[styles.pillLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Events
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Recent Entries
          </Text>
          {recentEntries.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={32} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                No entries yet
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Tap the + button to add your first sagan entry
              </Text>
            </View>
          ) : (
            recentEntries.map((e) => (
              <EntryCard key={e.id} entry={e} eventName={e.eventId ? eventMap[e.eventId] : undefined} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 16 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  statAmount: { color: "#fff", fontSize: 22 },
  netCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  netLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  netLabel: { fontSize: 14 },
  netAmount: { fontSize: 20 },
  pillsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  pillNum: { fontSize: 20, marginBottom: 2 },
  pillLabel: { fontSize: 11 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, marginTop: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center" },
});
