import { CircleDot, Dribbble, Feather, Goal, Swords, Target, Trophy, type LucideIcon } from "lucide-react";
import { SPORTS, SURFACES, type Sport, type Surface } from "@/types/ground";

/** Portal labels and icons for turf-api's 7 sports (the admin ground form's list). */
export const SPORT_META: Record<Sport, { label: string; Icon: LucideIcon }> = {
  football:   { label: "Football",   Icon: Goal },
  cricket:    { label: "Cricket",    Icon: CircleDot },
  badminton:  { label: "Badminton",  Icon: Feather },
  tennis:     { label: "Tennis",     Icon: Target },
  hockey:     { label: "Hockey",     Icon: Swords },
  basketball: { label: "Basketball", Icon: Dribbble },
  other:      { label: "Other",      Icon: Trophy },
};

export const SURFACE_LABEL: Record<Surface, string> = {
  "outdoor-turf": "Outdoor turf",
  "indoor-court": "Indoor court",
  "covered-net": "Covered net",
};

export { SPORTS, SURFACES };
