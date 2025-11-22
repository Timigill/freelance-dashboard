import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Invoice from "@/models/Invoice";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// ✅ helper to get logged-in user ID from session
const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// ✅ GET all invoices for logged-in user
export async function GET(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST create invoice for logged-in user
export async function POST(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    if (!body.client || !body.amount) {
      return NextResponse.json(
        { error: "Client and amount are required" },
        { status: 400 }
      );
    }

    // Generate unique invoice ID
    let nextNum = 1;
    let newId;
    while (true) {
      newId = `INV-${String(nextNum).padStart(3, "0")}`;
      const exists = await Invoice.findOne({ id: newId });
      if (!exists) break;
      nextNum++;
    }

    const invoice = await Invoice.create({ ...body, id: newId, userId });
    return NextResponse.json(invoice); // ✅ only the new invoice
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// PUT update invoice
export async function PUT(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    const updated = await Invoice.findOneAndUpdate(
      { _id: body._id, userId },
      body,
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json(updated); 
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// ✅ DELETE invoice for logged-in user
export async function DELETE(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Invoice ID required" },
        { status: 400 }
      );

    const deleted = await Invoice.findOneAndDelete({ _id: id, userId });
    if (!deleted)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
