import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddEventSheet } from "@/components/AddEventSheet";
import { EntryCard } from "@/components/EntryCard";
import { TopBar } from "@/components/TopBar";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";
import { SaganEvent } from "@/types";

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}
function formatAmount(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events, entries, deleteEvent } = useSagan();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const bottomPad =
    Platform.OS === "web" ? 34 : insets.bottom + (Platform.OS === "ios" ? 84 : 70);

  const eventStats = useMemo(() => {
    const map: Record<string, { received: number; given: number; count: number }> = {};
    for (const ev of events) {
      map[ev.id] = { received: 0, given: 0, count: 0 };
    }
    for (const e of entries) {
      if (e.eventId && map[e.eventId]) {
        map[e.eventId].count++;
        if (e.type === "received") map[e.eventId].received += e.amount;
        else map[e.eventId].given += e.amount;
      }
    }
    return map;
  }, [events, entries]);

  const selectedEvent = useMemo(
    () => events.find((ev) => ev.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const linkedEntries = useMemo(
    () => entries.filter((e) => e.eventId === selectedEventId),
    [entries, selectedEventId]
  );

  const handleDeleteEvent = (ev: SaganEvent) => {
    Alert.alert("Delete Event", `Delete "${ev.name}"? Linked entries will remain but lose their event link.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteEvent(ev.id);
          if (selectedEventId === ev.id) setSelectedEventId(null);
        },
      },
    ]);
  };

  if (selectedEvent) {
    const stats = eventStats[selectedEvent.id] ?? { received: 0, given: 0, count: 0 };
    const net = stats.received - stats.given;
    const receivedEntries = linkedEntries.filter((e) => e.type === "received");
    const givenEntries = linkedEntries.filter((e) => e.type === "given");

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar />
        <View style={[styles.detailHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => setSelectedEventId(null)} style={styles.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.detailTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
            {selectedEvent.name}
          </Text>
          <Pressable onPress={() => handleDeleteEvent(selectedEvent)} hitSlop={8}>
            <Feather name="trash-2" size={19} color={colors.destructive} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.eventMeta, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.occasionBadge, { backgroundColor: colors.givenBg }]}>
              <Text style={[styles.occasionText, { color: colors.given, fontFamily: "Inter_600SemiBold" }]}>
                {selectedEvent.occasionType}
              </Text>
            </View>
            <Text style={[styles.metaDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {formatDate(selectedEvent.date)}
            </Text>
            {selectedEvent.notes ? (
              <Text style={[styles.metaNotes, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {selectedEvent.notes}
              </Text>
            ) : null}
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#2D8A4E" }]}>
              <Text style={[styles.summaryLabel, { fontFamily: "Inter_500Medium" }]}>Received</Text>
              <Text style={[styles.summaryAmt, { fontFamily: "Inter_700Bold" }]}>{formatAmount(stats.received)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#E8851A" }]}>
              <Text style={[styles.summaryLabel, { fontFamily: "Inter_500Medium" }]}>Given</Text>
              <Text style={[styles.summaryAmt, { fontFamily: "Inter_700Bold" }]}>{formatAmount(stats.given)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: net >= 0 ? "#2D8A4E" : "#CC3333" }]}>
              <Text style={[styles.summaryLabel, { fontFamily: "Inter_500Medium" }]}>Net</Text>
              <Text style={[styles.summaryAmt, { fontFamily: "Inter_700Bold" }]}>
                {net >= 0 ? "+" : ""}{formatAmount(net)}
              </Text>
            </View>
          </View>

          {receivedEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.received, fontFamily: "Inter_600SemiBold" }]}>
                Received ({receivedEntries.length})
              </Text>
              {receivedEntries.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </View>
          )}

          {givenEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.given, fontFamily: "Inter_600SemiBold" }]}>
                Given ({givenEntries.length})
              </Text>
              {givenEntries.map((e) => (
                <EntryCard key={e.id} entry={e} />
              ))}
            </View>
          )}

          {linkedEntries.length === 0 && (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={28} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                No entries linked to this event yet
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => setShowAddEvent(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={[styles.createBtnText, { fontFamily: "Inter_600SemiBold" }]}>Create Event</Text>
        </Pressable>

        {events.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="calendar" size={32} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No events yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Create an event to group your sagan entries
            </Text>
          </View>
        ) : (
          events.map((ev) => {
            const s = eventStats[ev.id] ?? { received: 0, given: 0, count: 0 };
            return (
              <Pressable
                key={ev.id}
                style={({ pressed }) => [
                  styles.eventCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                ]}
                onPress={() => setSelectedEventId(ev.id)}
              >
                <View style={styles.eventCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.eventName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {ev.name}
                    </Text>
                    <Text style={[styles.eventDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {formatDate(ev.date)}
                    </Text>
                  </View>
                  <View style={[styles.occasionBadge, { backgroundColor: colors.givenBg }]}>
                    <Text style={[styles.occasionText, { color: colors.given, fontFamily: "Inter_600SemiBold" }]}>
                      {ev.occasionType}
                    </Text>
                  </View>
                </View>
                <View style={[styles.eventCardStats, { borderTopColor: colors.border }]}>
                  <Text style={[styles.eventStat, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.count} {s.count === 1 ? "entry" : "entries"}
                  </Text>
                  <Text style={[styles.eventStat, { color: colors.received, fontFamily: "Inter_500Medium" }]}>
                    +{formatAmount(s.received)}
                  </Text>
                  <Text style={[styles.eventStat, { color: colors.given, fontFamily: "Inter_500Medium" }]}>
                    -{formatAmount(s.given)}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <AddEventSheet visible={showAddEvent} onClose={() => setShowAddEvent(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 12 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  createBtnText: { color: "#fff", fontSize: 15 },
  eventCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventCardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  eventName: { fontSize: 16, marginBottom: 2 },
  eventDate: { fontSize: 12 },
  occasionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  occasionText: { fontSize: 12 },
  eventCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  eventStat: { fontSize: 13 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16 },
  emptyText: { fontSize: 13, textAlign: "center" },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  backBtn: {},
  detailTitle: { flex: 1, fontSize: 17 },
  eventMeta: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  metaDate: { fontSize: 13 },
  metaNotes: { fontSize: 13 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  summaryLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  summaryAmt: { color: "#fff", fontSize: 15 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, marginBottom: 10 },
});
