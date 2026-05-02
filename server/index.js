const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(express.json());

// ─── In-memory data store ────────────────────────────────────────────────────

const grounds = [
  {
    id: "GR-01",
    branchId: "BR-01",
    name: "Green Arena",
    type: "football",
    size: "100x60 m",
    capacity: 22,
    photos: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Parking", "Changing Room"],
    pricePerHour: 1200,
    openingTime: "06:00",
    closingTime: "23:00",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-02",
    branchId: "BR-01",
    name: "Blue Pitch",
    type: "cricket",
    size: "130x70 m",
    capacity: 30,
    photos: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Scoreboard", "Pavilion"],
    pricePerHour: 1800,
    openingTime: "07:00",
    closingTime: "22:00",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-03",
    branchId: "BR-01",
    name: "Red Court",
    type: "badminton",
    size: "13x6 m",
    capacity: 4,
    photos: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["AC", "Lighting"],
    pricePerHour: 600,
    openingTime: "06:00",
    closingTime: "22:00",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-04",
    branchId: "BR-01",
    name: "Gold Tennis",
    type: "tennis",
    size: "24x11 m",
    capacity: 4,
    photos: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Equipment Rental"],
    pricePerHour: 900,
    openingTime: "07:00",
    closingTime: "21:00",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const bookings = [
  {
    id: "BK-001",
    customerId: "CU-01",
    customerName: "Rahim Uddin",
    customerPhone: "+880 1711-234567",
    customerEmail: "rahim.uddin@example.com",
    customerTotalBookings: 14,
    groundId: "GR-01",
    groundName: "Green Arena",
    groundType: "football",
    groundCapacity: 22,
    groundOpeningTime: "06:00",
    groundClosingTime: "23:00",
    groundIsActive: true,
    date: () => new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    startTime: "10:00",
    endTime: "11:00",
    duration: 1,
    pricePerHour: 1200,
    amount: 1200,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "card",
    cardLast4: "4242",
    stripeTransactionId: "pi_3PqA1RLkdIwHu7ix0QMHBFR2",
    notes: "",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString() },
      { event: "Payment completed", timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString() },
      { event: "Booking confirmed", timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "BK-002",
    customerId: "CU-02",
    customerName: "Karim Hossain",
    customerPhone: "+880 1812-345678",
    customerEmail: "karim.hossain@example.com",
    customerTotalBookings: 3,
    groundId: "GR-02",
    groundName: "Blue Pitch",
    groundType: "cricket",
    groundCapacity: 30,
    groundOpeningTime: "07:00",
    groundClosingTime: "22:00",
    groundIsActive: true,
    date: () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    startTime: "13:00",
    endTime: "15:00",
    duration: 2,
    pricePerHour: 1200,
    amount: 2400,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "upi",
    cardLast4: null,
    stripeTransactionId: null,
    notes: "Needs extra seating",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 29 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "BK-003",
    customerId: "CU-03",
    customerName: "Nasrin Akter",
    customerPhone: "+880 1913-456789",
    customerEmail: "nasrin.akter@example.com",
    customerTotalBookings: 7,
    groundId: "GR-03",
    groundName: "Red Court",
    groundType: "badminton",
    groundCapacity: 4,
    groundOpeningTime: "08:00",
    groundClosingTime: "21:00",
    groundIsActive: true,
    date: () => new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    startTime: "16:00",
    endTime: "17:00",
    duration: 1,
    pricePerHour: 900,
    amount: 900,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "card",
    cardLast4: "1234",
    stripeTransactionId: "pi_3PqB2SLkdIwHu7ix1RNIBGS3",
    notes: "",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 3.95 * 60 * 60 * 1000).toISOString() },
      { event: "Payment completed", timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString() },
      { event: "Booking confirmed", timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "BK-004",
    customerId: "CU-04",
    customerName: "Salam Sheikh",
    customerPhone: "+880 1614-567890",
    customerEmail: "salam.sheikh@example.com",
    customerTotalBookings: 21,
    groundId: "GR-01",
    groundName: "Green Arena",
    groundType: "football",
    groundCapacity: 22,
    groundOpeningTime: "06:00",
    groundClosingTime: "23:00",
    groundIsActive: true,
    date: () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    startTime: "19:00",
    endTime: "21:00",
    duration: 2,
    pricePerHour: 1200,
    amount: 2400,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "card",
    cardLast4: "9999",
    stripeTransactionId: "pi_3PqC3TLkdIwHu7ix2SOJCHT4",
    notes: "",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 5.95 * 60 * 60 * 1000).toISOString() },
      { event: "Payment completed", timestamp: new Date(Date.now() - 5.7 * 60 * 60 * 1000).toISOString() },
      { event: "Booking confirmed", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "BK-005",
    customerId: "CU-05",
    customerName: "Farida Begum",
    customerPhone: "+880 1515-678901",
    customerEmail: "farida.begum@example.com",
    customerTotalBookings: 5,
    groundId: "GR-04",
    groundName: "Gold Tennis",
    groundType: "tennis",
    groundCapacity: 4,
    groundOpeningTime: "06:00",
    groundClosingTime: "22:00",
    groundIsActive: true,
    date: () => new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    startTime: "08:00",
    endTime: "09:00",
    duration: 1,
    pricePerHour: 900,
    amount: 900,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    cardLast4: "5566",
    stripeTransactionId: "pi_3PqD4ULkdIwHu7ix3TPKDIU5",
    notes: "Customer cancelled",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 9.95 * 60 * 60 * 1000).toISOString() },
      { event: "Payment completed", timestamp: new Date(Date.now() - 9.7 * 60 * 60 * 1000).toISOString() },
      { event: "Booking confirmed", timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString() },
      { event: "Booking cancelled & refund issued", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "BK-006",
    customerId: "CU-06",
    customerName: "Jahangir Alam",
    customerPhone: "+880 1716-789012",
    customerEmail: "jahangir.alam@example.com",
    customerTotalBookings: 9,
    groundId: "GR-02",
    groundName: "Blue Pitch",
    groundType: "cricket",
    groundCapacity: 30,
    groundOpeningTime: "07:00",
    groundClosingTime: "22:00",
    groundIsActive: true,
    date: () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    pricePerHour: 1800,
    amount: 3600,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "card",
    cardLast4: "3344",
    stripeTransactionId: "pi_3PqE5VLkdIwHu7ix4UQLEJV6",
    notes: "",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { event: "Booking created", timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
      { event: "Confirmation email sent", timestamp: new Date(Date.now() - 35.9 * 60 * 60 * 1000).toISOString() },
      { event: "Payment completed", timestamp: new Date(Date.now() - 35.5 * 60 * 60 * 1000).toISOString() },
      { event: "Booking confirmed", timestamp: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString() },
      { event: "Session completed", timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
    ],
  },
];

// Serialize a booking (resolve date function if dynamic)
function serializeBooking(b) {
  return { ...b, date: typeof b.date === "function" ? b.date() : b.date };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/grounds
app.get("/api/grounds", (_req, res) => {
  res.json({ success: true, data: grounds });
});

// GET /api/bookings
app.get("/api/bookings", (_req, res) => {
  res.json({ success: true, data: bookings.map(serializeBooking) });
});

// GET /api/bookings/upcoming  (must be before /api/bookings/:id)
app.get("/api/bookings/upcoming", (_req, res) => {
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;
  const upcoming = bookings
    .map(serializeBooking)
    .filter((b) => {
      const t = new Date(b.date).getTime();
      return t >= now && t <= in24h;
    })
    .map(({ id, customerId, groundId, groundName, date, startTime, endTime, duration, amount, status, paymentStatus }) => ({
      id, customerId, groundId: groundName, date, startTime, endTime, duration, amount, status, paymentStatus,
    }));
  res.json({ success: true, data: upcoming });
});

// GET /api/bookings/:id
app.get("/api/bookings/:id", (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  res.json({ success: true, data: serializeBooking(booking) });
});

// PATCH /api/bookings/:id/status
app.patch("/api/bookings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, refund } = req.body;
  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  booking.status = status;
  if (status === "cancelled" && refund) {
    booking.paymentStatus = "refunded";
    booking.timeline.push({
      event: "Booking cancelled & refund issued",
      timestamp: new Date().toISOString(),
    });
  } else if (status === "confirmed") {
    booking.timeline.push({
      event: "Booking confirmed",
      timestamp: new Date().toISOString(),
    });
  }
  booking.updatedAt = new Date().toISOString();
  res.json({
    success: true,
    data: { id, status, paymentStatus: booking.paymentStatus },
    message: `Booking ${id} updated to ${status}${refund ? " with refund" : ""}`,
  });
});

// GET /api/dashboard/stats
app.get("/api/dashboard/stats", (_req, res) => {
  const today = bookings.filter((b) => {
    const d = new Date(typeof b.date === "function" ? b.date() : b.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayRevenue = today
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  res.json({
    success: true,
    data: {
      todayRevenue: todayRevenue || 18500,
      todayRevenueTrend: 12.4,
      todayBookings: today.length || 9,
      todayBookingsTrend: -3.1,
      totalCustomers: 87,
      totalCustomersTrend: 8.0,
      activeGrounds: grounds.filter((g) => g.isActive).length,
      activeGroundsTrend: 0,
    },
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Turf Admin API running at http://localhost:${PORT}/api`);
});
