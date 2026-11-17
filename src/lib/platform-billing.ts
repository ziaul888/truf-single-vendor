/** BDT has 100 poisha; parse text without floating-point multiplication of fractions. */
export function bdtMinorUnits(value: string) {
  const input = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(input))
    throw new Error("Enter a valid price with up to two decimal places");
  const [whole, fraction = ""] = input.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000_000)
    throw new Error("Enter a price between 0.01 and 10,000,000 BDT");
  return amount;
}
export const formatBdt = (minor: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
  }).format(minor / 100);
export function billingTodayInput() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export const displayBillingDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  );
