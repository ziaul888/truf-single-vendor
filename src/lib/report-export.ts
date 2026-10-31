import * as XLSX from "xlsx";
import { redirectToLogin } from "./redirect-to-login";
import type { ExportType, GroupBy } from "@/types/report";

export type ExportFormat = "csv" | "xlsx";

export interface ExportRequest {
  type: ExportType;
  format: ExportFormat;
  /** Required for revenue and bookings; optional for customers (customers who joined in the range). */
  from?: string;
  to?: string;
  /** Revenue only: day or week. */
  groupBy?: Extract<GroupBy, "day" | "week">;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

/** The API's file name from Content-Disposition, or a fallback. */
function fileNameOf(res: Response, type: ExportType) {
  const match = res.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/);
  return match?.[1] ?? `${type}.csv`;
}

// Plain numbers (money, counts) become real numbers in Excel; anything with a leading
// zero or other characters (phones, booking numbers, dates) stays text.
const NUMERIC = /^-?(0|[1-9]\d*)(\.\d+)?$/;

function csvToWorkbook(csv: string, sheetName: string) {
  const parsed = XLSX.read(csv.replace(/^﻿/, ""), { type: "string", raw: true });
  const rows = XLSX.utils.sheet_to_json<string[]>(parsed.Sheets[parsed.SheetNames[0]], { header: 1, raw: true });
  const typed = rows.map((row, i) => (i === 0 ? row : row.map((c) => (NUMERIC.test(c) ? Number(c) : c))));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(typed), sheetName);
  return wb;
}

/**
 * Downloads a report from turf-api (streamed CSV, no row limit). Excel is made in the
 * browser from that CSV. Errors come back as JSON, so they're thrown with the API's message.
 */
export async function downloadReport({ type, format, from, to, groupBy }: ExportRequest) {
  const params = new URLSearchParams({ type });
  if (from && to) { params.set("from", from); params.set("to", to); }
  if (groupBy) params.set("groupBy", groupBy);

  const res = await fetch(`/api/v1/admin/reports/export?${params}`);
  if (res.status === 401) redirectToLogin();
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.details?.[0]?.message ?? json?.error ?? "The export failed. Please try again.");
  }

  const filename = fileNameOf(res, type);
  if (format === "csv") {
    saveBlob(await res.blob(), filename);
    return;
  }
  const sheet = type.charAt(0).toUpperCase() + type.slice(1);
  XLSX.writeFile(csvToWorkbook(await res.text(), sheet), filename.replace(/\.csv$/, ".xlsx"));
}
