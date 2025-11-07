import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Invoice from "@/models/Invoice";

export async function GET() {
  await dbConnect();
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  return NextResponse.json(invoices);
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // ✅ Get last invoice to generate new ID
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastId = lastInvoice?.id || "INV-000";
    const nextNum = parseInt(lastId.split("-")[1]) + 1;
    const newId = `INV-${String(nextNum).padStart(3, "0")}`;

    // ✅ Create invoice with unique ID
    const invoice = await Invoice.create({
      ...body,
      id: newId,
    });

    const updated = await Invoice.find().sort({ createdAt: -1 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    await Invoice.findByIdAndUpdate(body._id, body, { new: true });
    const updated = await Invoice.find().sort({ createdAt: -1 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
