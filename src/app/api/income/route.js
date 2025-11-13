import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import IncomeSource from "@/models/IncomeSource";
import Client from "@/models/Client"; // ← ✅ You forgot this import
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

export async function GET(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const incomeSources = await IncomeSource.find({ userId })
      .select(
        "name clientId clientName amount payments isActive frequency type createdAt"
      )
      .sort({ createdAt: -1 });

    const clients = await Client.find({ userId }).select("name _id company");

    const updatedIncome = incomeSources.map((src) => {
      const client =
        clients.find((c) => c._id.toString() === src.clientId?.toString()) ||
        null;

      return {
        ...src.toObject(),
        clientName:
          src.clientName || client?.company
            ? `${client?.company} — ${client?.name}`
            : client?.name || "Unknown",
        amount: Number(src.amount) || 0,
        isActive: src.isActive ?? true, // default true if not set
      };
    });

    return NextResponse.json(updatedIncome);
  } catch (err) {
    console.error("Error in GET /api/income:", err);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    if (!body.name || body.amount == null) {
      return NextResponse.json(
        { error: "Name and amount required" },
        { status: 400 }
      );
    }

    const newIncome = await IncomeSource.create({
      ...body,
      userId,
      clientName: body.clientName || "Unknown",
      amount: Number(body.amount) || 0,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(newIncome, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/income:", err);
    return NextResponse.json(
      { error: "Failed to create income source" },
      { status: 500 }
    );
  }
}

// ✅ PUT update income source for logged-in user
export async function PUT(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    if (!body._id)
      return NextResponse.json({ error: "_id required" }, { status: 400 });

    const updated = await IncomeSource.findOneAndUpdate(
      { _id: body._id, userId },
      body,
      { new: true, runValidators: true }
    );

    if (!updated)
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 }
      );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error in PUT /api/income:", err);
    return NextResponse.json(
      { error: "Failed to update income source" },
      { status: 500 }
    );
  }
}

// ✅ DELETE income source for logged-in user
export async function DELETE(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Income source ID required" },
        { status: 400 }
      );

    const deleted = await IncomeSource.findOneAndDelete({ _id: id, userId });
    if (!deleted)
      return NextResponse.json(
        { error: "Income source not found" },
        { status: 404 }
      );

    return NextResponse.json({ message: "Income source deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE /api/income:", err);
    return NextResponse.json(
      { error: "Failed to delete income source" },
      { status: 500 }
    );
  }
}
