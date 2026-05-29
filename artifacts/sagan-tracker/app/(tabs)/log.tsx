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
import { EntryCard } from "@/components/EntryCard";
import { TopBar } from "@/components/TopBar";
import { useSagan } from "@/context/SaganContext";
import { useColors } from "@/hooks/useColors";
import { Entry } from "@/types";

type FilterType = "all" | "received" | "given";
type SortType = "newest" | "oldest" | "amount_asc" | "amount_desc";

const SORT_OPTIONS: { key: SortType; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "amount_asc", label: "Amount ↑" },
  { key: "amount_desc", label: "Amount ↓" },
];

function sortEntries(entries: Entry[], sort: SortType): Entry[] {
  return [...entries].sort((a, b) => {
    if (sort === "newest") return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    if (sort === "oldest") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
    if (sort === "amount_asc") return a.amount - b.amount;
    if (sort === "amount_desc") return b.amount - a.amount;
    return 0;
  });
}

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, events } = useSagan();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");

  const eventMap = useMemo(
    () => Object.fromEntries(events.map((ev) => [ev.id, ev.name])),
    [events]
  );

  const filtered = useMemo(() => {
    let list = entries;
    if (filter !== "all") list = list.filter((e) => e.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.personName.toLowerCase().includes(q) ||
          e.occasion.toLowerCase().includes(q) ||
          (e.eventId && eventMap[e.eventId]?.toLowerCase().includes(q))
      );
    }
    return sortEntries(list, sort);
  }, [entries, filter, sort, search, eventMap]);

  const bottomPad =
    Platform.OS === "web" ? 34 : insets.bottom + (Platform.OS === "ios" ? 84 : 70);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <View style={[styles.controls, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {(["all", "received", "given"] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              style={[
                styles.filterBtn,
                filter === f && {
                  backgroundColor:
                    f === "received"
                      ? colors.received
                      : f === "given"
                      ? colors.given
                      : colors.primary,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  { fontFamily: "Inter_500Medium" },
                  filter === f ? { color: "#fff" } : { color: colors.mutedForeground },
                ]}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, occasion, event..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
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
            <Feather name={search ? "search" : "inbox"} size={32} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {search ? "No results found" : "No entries yet"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {search
                ? "Try a different search term"
                : "Tap the + button to add your first entry"}
            </Text>
          </View>
        ) : (
          filtered.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              eventName={e.eventId ? eventMap[e.eventId] : undefined}
            />
          ))
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
  filterRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  filterText: { fontSize: 13 },
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
  sortRow: { flexDirection: "row" },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  sortText: { fontSize: 12 },
  list: { padding: 16, paddingTop: 12 },
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
