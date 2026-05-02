import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      todayRevenue: 18500,
      todayRevenueTrend: 12.4,
      todayBookings: 9,
      todayBookingsTrend: -3.1,
      totalCustomers: 87,
      totalCustomersTrend: 8.0,
      activeGrounds: 4,
      activeGroundsTrend: 0,
    },
  });
}
