// Stub data shared across portal pages. Replace each call site with
// `await api.grounds.list()` / `api.grounds.get(id)` once the backend is wired.

import type { Ground } from "@/types/api";

export const VENUE = {
  name: "Champions Turf",
  address: "Plot 7, Road 11, Banani, Dhaka 1213",
  phone: "+880 1700 000 000",
  email: "hello@championsturf.com",
  openHours: "06:00 — 23:00",
  rating: 4.9,
  reviewCount: 312,
};

export const GROUNDS: Ground[] = [
  {
    id: "g-pitch-a",
    name: "Pitch A",
    sport: "football", format: "5x5", surface: "outdoor-turf",
    dimensions: "28×18 m", capacity: 10,
    hourlyRate: 1200, peakRate: 1500, peakStartHour: 18, peakEndHour: 22,
    openHour: 6, closeHour: 23,
    amenities: ["FIFA-grade turf", "Floodlights", "28×18 m"],
    images: [
      "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600",
    ],
    rating: 4.9, reviewCount: 142,
  },
  {
    id: "g-pitch-b",
    name: "Pitch B",
    sport: "football", format: "6x6", surface: "outdoor-turf",
    dimensions: "36×22 m", capacity: 12,
    hourlyRate: 1500, peakRate: 1800, peakStartHour: 18, peakEndHour: 22,
    openHour: 6, closeHour: 23,
    amenities: ["FIFA-grade turf", "Floodlights", "36×22 m"],
    images: ["https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200"],
    rating: 4.8, reviewCount: 96,
  },
  {
    id: "g-pitch-c",
    name: "Pitch C",
    sport: "football", format: "7x7", surface: "outdoor-turf",
    dimensions: "50×30 m", capacity: 14,
    hourlyRate: 1800, peakRate: 2200, peakStartHour: 18, peakEndHour: 22,
    openHour: 6, closeHour: 23,
    amenities: ["FIFA-grade turf", "Spectator seating", "50×30 m"],
    images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200"],
    rating: 4.7, reviewCount: 58,
  },
  {
    id: "g-main",
    name: "Main Pitch",
    sport: "football", format: "11x11", surface: "outdoor-turf",
    capacity: 22,
    hourlyRate: 3500, peakRate: 4500, peakStartHour: 18, peakEndHour: 22,
    openHour: 6, closeHour: 23,
    amenities: ["Match-grade", "Floodlights", "Dugouts"],
    images: ["https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200"],
    rating: 4.9, reviewCount: 16,
  },
  {
    id: "g-cricket",
    name: "Cricket Net",
    sport: "cricket", format: "net", surface: "covered-net",
    capacity: 6,
    hourlyRate: 1200, openHour: 6, closeHour: 23,
    amenities: ["Turf wicket", "Bowling machine", "2 lanes"],
    images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200"],
    rating: 4.6, reviewCount: 42,
  },
  {
    id: "g-court-1",
    name: "Court 1",
    sport: "badminton", format: "court", surface: "indoor-court",
    capacity: 4,
    hourlyRate: 400, openHour: 6, closeHour: 23,
    amenities: ["Wooden floor", "AC", "Racket rental"],
    images: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200"],
    rating: 4.7, reviewCount: 28,
  },
];

export const SPORT_COUNTS: Record<Ground["sport"], number> = GROUNDS.reduce(
  (acc, g) => {
    acc[g.sport] = (acc[g.sport] ?? 0) + 1;
    return acc;
  },
  { football: 0, cricket: 0, badminton: 0 } as Record<Ground["sport"], number>
);

export function findGround(id: string) {
  return GROUNDS.find((g) => g.id === id);
}

export const FORMAT_LABEL: Record<Ground["format"], string> = {
  "5x5": "5×5",
  "6x6": "6×6",
  "7x7": "7×7",
  "11x11": "11×11",
  "net": "CRICKET",
  "court": "BADMINTON",
};
