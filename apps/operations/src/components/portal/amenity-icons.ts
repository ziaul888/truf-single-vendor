import {
  Armchair, Car, Coffee, Droplets, GlassWater, Heart, Lightbulb, Lock, Shirt, Wifi, type LucideIcon,
} from "lucide-react";
import type { AmenityIconKey } from "@/validations/website-settings";

export const AMENITY_ICONS: Record<AmenityIconKey, { Icon: LucideIcon; label: string }> = {
  parking: { Icon: Car, label: "Parking" },
  showers: { Icon: Droplets, label: "Showers" },
  lockers: { Icon: Lock, label: "Lockers" },
  cafe: { Icon: Coffee, label: "Café" },
  wifi: { Icon: Wifi, label: "Wi-Fi" },
  firstAid: { Icon: Heart, label: "First aid" },
  floodlights: { Icon: Lightbulb, label: "Floodlights" },
  seating: { Icon: Armchair, label: "Seating" },
  water: { Icon: GlassWater, label: "Drinking water" },
  changing: { Icon: Shirt, label: "Changing room" },
};
