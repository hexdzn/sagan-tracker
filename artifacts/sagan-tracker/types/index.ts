export type EntryType = "received" | "given";

export interface Entry {
  id: string;
  type: EntryType;
  date: string;
  occasion: string;
  eventId?: string;
  amount: number;
  personName: string;
  relationshipTag: string;
  notes?: string;
  createdAt: string;
}

export interface SaganEvent {
  id: string;
  name: string;
  date: string;
  occasionType: string;
  notes?: string;
  createdAt: string;
}

export const OCCASION_SUGGESTIONS = [
  "Diwali",
  "Holi",
  "Wedding",
  "Birthday",
  "Navratri",
  "Bhai Dooj",
  "Eid",
  "Christmas",
  "New Year",
  "Raksha Bandhan",
];

export const RELATIONSHIP_SUGGESTIONS = [
  "Uncle",
  "Aunty",
  "Neighbour",
  "Family Friend",
  "Cousin",
  "Colleague",
  "Brother",
  "Sister",
  "Mother",
  "Father",
  "Grandfather",
  "Grandmother",
];

export const OCCASION_TYPES = [
  "Wedding",
  "Diwali",
  "Birthday",
  "Holi",
  "Navratri",
  "Bhai Dooj",
  "Other",
];
