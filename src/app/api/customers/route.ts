import { NextRequest, NextResponse } from "next/server";

function tag(bookings: number): "VIP" | "Regular" | "New" {
  if (bookings >= 10) return "VIP";
  if (bookings >= 3)  return "Regular";
  return "New";
}

const raw = [
  { id: "CU-01", name: "Rahim Khan",       phone: "+880 1712 345678", email: "rahim@example.com",    since: "2024-01-15", bookings: 14, totalSpent: 28000, lastBooking: "2026-04-20", dueAmount: 2000 },
  { id: "CU-02", name: "Kamal Hossain",    phone: "+880 1812 654321", email: "kamal@example.com",    since: "2024-02-03", bookings: 12, totalSpent: 24000, lastBooking: "2026-04-18", dueAmount: 0    },
  { id: "CU-03", name: "Rafiq Ahmed",      phone: "+880 1612 887766", email: "rafiq@example.com",    since: "2023-11-20", bookings: 11, totalSpent: 22000, lastBooking: "2026-04-10", dueAmount: 3000 },
  { id: "CU-04", name: "Humayun Kabir",    phone: "+880 1712 001122", email: "humayun@example.com",  since: "2024-05-15", bookings:  9, totalSpent: 18000, lastBooking: "2026-04-07", dueAmount: 0    },
  { id: "CU-05", name: "Jasmin Begum",     phone: "+880 1812 223344", email: "jasmin@example.com",   since: "2024-02-14", bookings:  8, totalSpent: 16000, lastBooking: "2026-04-08", dueAmount: 0    },
  { id: "CU-06", name: "Shahidul Islam",   phone: "+880 1912 556677", email: "shahidul@example.com", since: "2024-01-30", bookings:  7, totalSpent: 14000, lastBooking: "2026-03-29", dueAmount: 2000 },
  { id: "CU-07", name: "Nadia Rahman",     phone: "+880 1912 111222", email: "nadia@example.com",    since: "2024-03-10", bookings:  6, totalSpent: 12000, lastBooking: "2026-04-15", dueAmount: 1500 },
  { id: "CU-08", name: "Rezaul Karim",     phone: "+880 1812 667788", email: "rezaul@example.com",   since: "2024-07-10", bookings:  6, totalSpent: 10800, lastBooking: "2026-04-03", dueAmount: 0    },
  { id: "CU-09", name: "Farhan Mahmud",    phone: "+880 1612 998877", email: "farhan@example.com",   since: "2024-03-20", bookings:  5, totalSpent:  9500, lastBooking: "2026-04-12", dueAmount: 0    },
  { id: "CU-10", name: "Farhana Yeasmin",  phone: "+880 1712 112233", email: "farhana@example.com",  since: "2024-09-15", bookings:  5, totalSpent:  9000, lastBooking: "2026-04-11", dueAmount: 1200 },
  { id: "CU-11", name: "Mizanur Rahman",   phone: "+880 1612 667788", email: "mizanur@example.com",  since: "2024-03-05", bookings:  5, totalSpent:  9000, lastBooking: "2026-04-01", dueAmount: 1800 },
  { id: "CU-12", name: "Rokeya Sultana",   phone: "+880 1712 334455", email: "rokeya@example.com",   since: "2024-02-28", bookings:  4, totalSpent:  7200, lastBooking: "2026-04-05", dueAmount: 0    },
  { id: "CU-13", name: "Sumaiya Islam",    phone: "+880 1612 334455", email: "sumaiya@example.com",  since: "2024-06-20", bookings:  4, totalSpent:  7200, lastBooking: "2026-03-30", dueAmount: 2400 },
  { id: "CU-14", name: "Morsheda Akter",   phone: "+880 1912 990011", email: "morsheda@example.com", since: "2024-08-05", bookings:  3, totalSpent:  5400, lastBooking: "2026-03-25", dueAmount: 0    },
  { id: "CU-15", name: "Tariq Miah",       phone: "+880 1712 445566", email: "tariq@example.com",    since: "2024-04-01", bookings:  3, totalSpent:  5000, lastBooking: "2026-04-10", dueAmount: 1000 },
  { id: "CU-16", name: "Tanvir Islam",     phone: "+880 1712 889900", email: "tanvir@example.com",   since: "2026-04-10", bookings:  2, totalSpent:  3600, lastBooking: "2026-04-21", dueAmount: 0    },
  { id: "CU-17", name: "Parveen Sultana",  phone: "+880 1912 778899", email: "parveen@example.com",  since: "2026-04-15", bookings:  2, totalSpent:  2400, lastBooking: "2026-04-18", dueAmount: 0    },
  { id: "CU-18", name: "Minhaj Hasan",     phone: "+880 1912 776655", email: "minhaj@example.com",   since: "2026-04-08", bookings:  1, totalSpent:  2000, lastBooking: "2026-04-16", dueAmount: 1000 },
  { id: "CU-19", name: "Maksuda Khanam",   phone: "+880 1912 889900", email: "maksuda@example.com",  since: "2026-04-19", bookings:  1, totalSpent:  1500, lastBooking: "2026-04-19", dueAmount: 1500 },
  { id: "CU-20", name: "Sadia Akter",      phone: "+880 1812 334455", email: "sadia@example.com",    since: "2026-04-05", bookings:  1, totalSpent:  1500, lastBooking: "2026-04-19", dueAmount: 0    },
  { id: "CU-21", name: "Arif Billah",      phone: "+880 1712 990011", email: "arif@example.com",     since: "2026-04-16", bookings:  1, totalSpent:  1800, lastBooking: "2026-04-16", dueAmount: 900  },
  { id: "CU-22", name: "Shirin Akter",     phone: "+880 1612 112233", email: "shirin@example.com",   since: "2026-04-12", bookings:  1, totalSpent:  1200, lastBooking: "2026-04-20", dueAmount: 600  },
  { id: "CU-23", name: "Dilruba Khatun",   phone: "+880 1612 223344", email: "dilruba@example.com",  since: "2026-04-17", bookings:  1, totalSpent:  1200, lastBooking: "2026-04-17", dueAmount: 0    },
  { id: "CU-24", name: "Nazmul Huda",      phone: "+880 1812 445566", email: "nazmul@example.com",   since: "2026-04-14", bookings:  1, totalSpent:   900, lastBooking: "2026-04-14", dueAmount: 0    },
  { id: "CU-25", name: "Sabbir Ahmed",     phone: "+880 1812 556677", email: "sabbir@example.com",   since: "2026-04-18", bookings:  1, totalSpent:   900, lastBooking: "2026-04-18", dueAmount: 0    },
];

export const customers = raw.map((c) => ({ ...c, tag: tag(c.bookings) }));

const thisMonth = "2026-04";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, since, tag: customerTag, adminNote } = body;
  if (!name || !phone || !email || !since) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }
  const duplicate = customers.find((c) => c.phone === phone);
  if (duplicate) {
    return NextResponse.json({ success: false, error: "Phone number already registered" }, { status: 409 });
  }
  const id = `CU-${String(customers.length + 1).padStart(2, "0")}`;
  const newCustomer = {
    id,
    name,
    phone,
    email,
    since,
    bookings: 0,
    totalSpent: 0,
    lastBooking: since,
    dueAmount: 0,
    tag: (customerTag as "VIP" | "Regular" | "New") ?? "New",
    adminNote: adminNote ?? "",
  };
  customers.push(newCustomer);
  return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const newThisMonth    = customers.filter((c) => c.since.startsWith(thisMonth)).length;
  const withDuePayments = customers.filter((c) => c.dueAmount > 0).length;
  const totalDueAmount  = customers.reduce((s, c) => s + c.dueAmount, 0);
  const totalRevenue    = customers.reduce((s, c) => s + c.totalSpent, 0);

  return NextResponse.json({
    success: true,
    data: {
      customers,
      stats: { total: customers.length, newThisMonth, withDuePayments, totalDueAmount, totalRevenue },
    },
  });
}
