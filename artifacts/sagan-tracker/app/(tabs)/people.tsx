import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopBar } from "@/components/TopBar";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";
import { Entry } from "@/types";

type SortType = "received" | "given" | "net" | "interactions";

function formatAmount(n: number): string {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}
function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}

interface PersonData {
  name: string;
  relationship: string;
  received: number;
  given: number;
  net: number;
  count: number;
  entries: Entry[];
}

export default function PeopleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, events } = useSagan();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("received");
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const eventMap = useMemo(
    () => Object.fromEntries(events.map((ev) => [ev.id, ev.name])),
    [events]
  );

  const people = useMemo<PersonData[]>(() => {
    const map = new Map<string, PersonData>();
    for (const e of entries) {
      const key = e.personName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: e.personName,
          relationship: e.relationshipTag,
          received: 0,
          given: 0,
          net: 0,
          count: 0,
          entries: [],
        });
      }
      const p = map.get(key)!;
      if (e.type === "received") p.received += e.amount;
      else p.given += e.amount;
      p.net = p.received - p.given;
      p.count++;
      p.entries.push(e);
    }
    return Array.from(map.values());
  }, [entries]);

  const filtered = useMemo(() => {
    let list = people;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.relationship.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "received") return b.received - a.received;
      if (sort === "given") return b.given - a.given;
      if (sort === "net") return b.net - a.net;
      return b.count - a.count;
    });
  }, [people, search, sort]);

  const bottomPad =
    Platform.OS === "web" ? 34 : insets.bottom + (Platform.OS === "ios" ? 84 : 70);

  const SORT_OPTIONS: { key: SortType; label: string }[] = [
    { key: "received", label: "Received" },
    { key: "given", label: "Given" },
    { key: "net", label: "Net" },
    { key: "interactions", label: "Interactions" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <View style={[styles.controls, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search people..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SORT_OPTIONS.map((s) => (
            <Pressable
              key={s.key}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sort === s.key ? colors.primary : colors.card,
                  borderColor: sort === s.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSort(s.key)}
            >
              <Text
                style={[
                  styles.sortText,
                  { fontFamily: "Inter_500Medium" },
                  sort === s.key ? { color: "#fff" } : { color: colors.mutedForeground },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
      >
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={search ? "search" : "users"} size={32} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {search ? "No people found" : "No people yet"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {search ? "Try a different name" : "Add entries to see people here"}
            </Text>
          </View>
        ) : (
          filtered.map((person) => {
            const isExpanded = expandedName === person.name.toLowerCase();
            return (
              <Pressable
                key={person.name.toLowerCase()}
                style={({ pressed }) => [
                  styles.personCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
                ]}
                onPress={() =>
                  setExpandedName(isExpanded ? null : person.name.toLowerCase())
                }
              >
                <View style={styles.personTop}>
                  <View style={[styles.avatar, { backgroundColor: colors.givenBg }]}>
                    <Text style={[styles.avatarText, { color: colors.given, fontFamily: "Inter_700Bold" }]}>
                      {person.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {person.name}
                    </Text>
                    <Text style={[styles.personRel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {person.relationship} · {person.count} {person.count === 1 ? "entry" : "entries"}
                    </Text>
                  </View>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>

                <View style={[styles.personStats, { borderTopColor: colors.border }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.received, fontFamily: "Inter_600SemiBold" }]}>
                      {formatAmount(person.received)}
                    </Text>
                    <Text style={[styles.statKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Received
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.given, fontFamily: "Inter_600SemiBold" }]}>
                      {formatAmount(person.given)}
                    </Text>
                    <Text style={[styles.statKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Given
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { fontFamily: "Inter_600SemiBold" },
                        person.net >= 0 ? { color: colors.received } : { color: colors.negative },
                      ]}
                    >
                      {person.net >= 0 ? "+" : ""}{formatAmount(person.net)}
                    </Text>
                    <Text style={[styles.statKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Net
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={[styles.expandedEntries, { borderTopColor: colors.border }]}>
                    {person.entries
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((e) => (
                        <View
                          key={e.id}
                          style={[styles.miniEntry, { borderBottomColor: colors.border }]}
                        >
                          <View
                            style={[
                              styles.miniBadge,
                              { backgroundColor: e.type === "received" ? colors.receivedBg : colors.givenBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                {
                                  color: e.type === "received" ? colors.received : colors.given,
                                  fontFamily: "Inter_600SemiBold",
                                },
                              ]}
                            >
                              {e.type === "received" ? "Rcvd" : "Givn"}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={[styles.miniOccasion, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                              {e.occasion}
                            </Text>
                            {e.eventId && eventMap[e.eventId] ? (
                              <Text style={[styles.miniEvent, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                                {eventMap[e.eventId]}
                              </Text>
                            ) : null}
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text
                              style={[
                                styles.miniAmount,
                                { fontFamily: "Inter_600SemiBold" },
                                { color: e.type === "received" ? colors.received : colors.given },
                              ]}
                            >
                              {formatAmount(e.amount)}
                            </Text>
                            <Text style={[styles.miniDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                              {formatDate(e.date)}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  sortText: { fontSize: 12 },
  list: { padding: 16, paddingTop: 12 },
  personCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  personTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },
  personName: { fontSize: 16, marginBottom: 2 },
  personRel: { fontSize: 12 },
  personStats: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  statValue: { fontSize: 14, marginBottom: 2 },
  statKey: { fontSize: 11 },
  statDivider: { width: StyleSheet.hairlineWidth },
  expandedEntries: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  miniEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  miniBadgeText: { fontSize: 10 },
  miniOccasion: { fontSize: 13, marginBottom: 1 },
  miniEvent: { fontSize: 11 },
  miniAmount: { fontSize: 13, marginBottom: 1 },
  miniDate: { fontSize: 11 },
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
