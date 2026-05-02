import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, refund, paymentStatus: explicitPaymentStatus } = body;

  let paymentStatus: string | undefined;
  if (status === "cancelled" && refund) {
    paymentStatus = "refunded";
  } else if (explicitPaymentStatus) {
    paymentStatus = explicitPaymentStatus;
  }

  // In a real app this would update the database
  return NextResponse.json({
    success: true,
    data: { id, status, paymentStatus },
    message: `Booking ${id} updated to ${status}${refund ? " with refund" : ""}`,
  });
}
