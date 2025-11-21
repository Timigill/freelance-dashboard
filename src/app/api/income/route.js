import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import IncomeSource from "@/models/IncomeSource";
import Client from "@/models/Client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const validTypes = ["Fixed Salary", "Task Based Salary", "Freelance"];

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id || session.user._id;
}

// ---------------- GET ----------------
export async function GET(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const incomeSources = await IncomeSource.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    const clients = await Client.find({ userId }).select("name company status").lean();

    const updatedIncome = incomeSources.map((src) => {
      const client = clients.find((c) => c._id.toString() === src.clientId?.toString()) || null;

      const clientName =
        src.clientName ||
        (client?.company ? `${client.company} — ${client.name}` : client?.name) ||
        "Unknown";

      const clientStatus = client ? client.status : src.isActive ? "active" : "inactive";

      return {
        ...src,
        clientName,
        clientStatus,
        amount: Number(src.amount) || 0,
      };
    });

    return NextResponse.json(updatedIncome);
  } catch (err) {
    console.error("GET /api/income error:", err);
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

    // Validate amount
    if (
      body.amount == null ||
      isNaN(Number(body.amount)) ||
      Number(body.amount) < 0
    ) {
      return NextResponse.json(
        { error: "Amount must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get client name
    let clientName = "Unknown";
    if (body.clientId) {
      const client = await Client.findById(body.clientId).lean();
      if (client) {
        clientName = client.company
          ? `${client.company} — ${client.name}`
          : client.name;
      }
    }

    // Ensure type is valid
    const type = validTypes.includes(body.type?.trim())
      ? body.type.trim()
      : "Fixed Salary";

    // Only include allowed fields
    const allowedFields = {
      amount: Number(body.amount),
      startDate: body.startDate || new Date(),
      endDate: body.endDate || null,
      frequency: body.frequency || "Monthly",
      description: body.description || "",
      clientId: body.clientId || null,
      clientName,
      type,
      isActive: body.isActive ?? true,
      userId,
    };

    const newIncome = await IncomeSource.create(allowedFields);

    return NextResponse.json(newIncome, { status: 201 });
  } catch (err) {
    console.error("POST /api/income error:", err);
    return NextResponse.json(
      { error: "Failed to create income source" },
      { status: 500 }
    );
  }
}

// ---------------- PUT ----------------
export async function PUT(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    if (!body._id)
      return NextResponse.json({ error: "_id required" }, { status: 400 });
    if (body.amount != null) body.amount = Number(body.amount);
    if (body.type)
      body.type = validTypes.includes(body.type?.trim())
        ? body.type.trim()
        : "Fixed Salary";

    if (body.clientId) {
      const client = await Client.findById(body.clientId).lean();
      if (client)
        body.clientName = client.company
          ? `${client.company} — ${client.name}`
          : client.name;
    }

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
    console.error("PUT /api/income error:", err);
    return NextResponse.json(
      { error: "Failed to update income source" },
      { status: 500 }
    );
  }
}

// ---------------- DELETE ----------------
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
    console.error("DELETE /api/income error:", err);
    return NextResponse.json(
      { error: "Failed to delete income source" },
      { status: 500 }
    );
  }
}
