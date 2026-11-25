// Display labels shared by portal pages. Ground lists and details come from src/services/portal-grounds.ts.

import type { GroundFormat } from "@/types/api";

export const FORMAT_LABEL: Record<GroundFormat, string> = {
  "4x4": "4×4",
  "5x5": "5×5",
  "6x6": "6×6",
  "7x7": "7×7",
  "8x8": "8×8",
  "9x9": "9×9",
  "11x11": "11×11",
  "net": "CRICKET",
  "court": "BADMINTON",
};
