import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Entry, SaganEvent } from "@/types";

const ENTRIES_KEY = "sagan_entries";
const EVENTS_KEY = "sagan_events";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

interface SaganContextType {
  entries: Entry[];
  events: SaganEvent[];
  addEntry: (entry: Omit<Entry, "id" | "createdAt">) => void;
  deleteEntry: (id: string) => void;
  addEvent: (event: Omit<SaganEvent, "id" | "createdAt">) => void;
  deleteEvent: (id: string) => void;
  showAddEntry: boolean;
  setShowAddEntry: (v: boolean) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  importData: (data: { entries: Entry[]; events: SaganEvent[] }) => void;
  isLoaded: boolean;
}

const SaganContext = createContext<SaganContextType | null>(null);

export function SaganProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [events, setEvents] = useState<SaganEvent[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [eStr, evStr] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(EVENTS_KEY),
        ]);
        if (eStr) setEntries(JSON.parse(eStr));
        if (evStr) setEvents(JSON.parse(evStr));
      } catch {}
      setIsLoaded(true);
    };
    load();
  }, []);

  const saveEntries = useCallback(async (data: Entry[]) => {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(data));
  }, []);

  const saveEvents = useCallback(async (data: SaganEvent[]) => {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(data));
  }, []);

  const addEntry = useCallback((entry: Omit<Entry, "id" | "createdAt">) => {
    const newEntry: Entry = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
    setEntries((prev) => {
      const updated = [newEntry, ...prev];
      saveEntries(updated);
      return updated;
    });
  }, [saveEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEntries(updated);
      return updated;
    });
  }, [saveEntries]);

  const addEvent = useCallback((event: Omit<SaganEvent, "id" | "createdAt">) => {
    const newEvent: SaganEvent = { ...event, id: generateId(), createdAt: new Date().toISOString() };
    setEvents((prev) => {
      const updated = [newEvent, ...prev];
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const importData = useCallback((data: { entries: Entry[]; events: SaganEvent[] }) => {
    setEntries(data.entries || []);
    setEvents(data.events || []);
    saveEntries(data.entries || []);
    saveEvents(data.events || []);
  }, [saveEntries, saveEvents]);

  return (
    <SaganContext.Provider
      value={{
        entries,
        events,
        addEntry,
        deleteEntry,
        addEvent,
        deleteEvent,
        showAddEntry,
        setShowAddEntry,
        showSettings,
        setShowSettings,
        importData,
        isLoaded,
      }}
    >
      {children}
    </SaganContext.Provider>
  );
}

export function useSagan() {
  const ctx = useContext(SaganContext);
  if (!ctx) throw new Error("useSagan must be used within SaganProvider");
  return ctx;
}
