/**
 * Google Maps directions to an address, from wherever the visitor is.
 * Opens the Maps app on phones, maps.google.com elsewhere. No API key needed.
 */
export const directionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
