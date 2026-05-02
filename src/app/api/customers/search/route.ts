import { NextRequest, NextResponse } from "next/server";

const customers = [
  { id: "CU-01", name: "Rahim Uddin", phone: "01711234567", email: "rahim@example.com" },
  { id: "CU-02", name: "Karim Hossain", phone: "01812345678", email: "karim@example.com" },
  { id: "CU-03", name: "Nasrin Akter", phone: "01913456789", email: "nasrin@example.com" },
  { id: "CU-04", name: "Salam Sheikh", phone: "01614567890", email: "salam@example.com" },
  { id: "CU-05", name: "Farida Begum", phone: "01515678901", email: "farida@example.com" },
];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("phone") ?? "";
  const normalized = raw.replace(/[\s\-+()]/g, "");

  if (normalized.length < 8) {
    return NextResponse.json({ success: false, error: "Phone too short" }, { status: 400 });
  }

  const customer = customers.find((c) => {
    const cp = c.phone.replace(/[\s\-+()]/g, "");
    return cp.includes(normalized) || normalized.includes(cp);
  });

  return NextResponse.json({ success: true, data: customer ?? null });
}
