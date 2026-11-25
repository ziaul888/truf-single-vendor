/**
 * Booking money for a cash booking: the share of the total paid up front by bKash / Nagad (amounts
 * in the smallest unit). For display only: it mirrors turf-api, which recomputes the amount itself.
 */
export const cashDepositAmount = (total: number, percent: number) => Math.min(total, Math.round((total * percent) / 100));
