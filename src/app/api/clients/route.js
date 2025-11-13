import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Client from "@/models/Client";
import IncomeSource from "@/models/IncomeSource";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { parsePhoneNumber } from "libphonenumber-js";

// Helper to get user ID from NextAuth session
const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// GET all clients
export async function GET() {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const clients = await Client.find({ userId }).lean();

    const clientIds = clients.map((c) => c._id);
    const incomeSources = await IncomeSource.find({
      clientId: { $in: clientIds },
      isActive: true,
      userId,
    }).lean();

    const incomeMap = {};
    incomeSources.forEach((src) => {
      const id = src.clientId.toString();
      if (!incomeMap[id]) incomeMap[id] = 0;
      if (src.payments?.length) {
        src.payments.forEach((p) => {
          incomeMap[id] += p.amount;
        });
      } else {
        incomeMap[id] += Number(src.amount || 0);
      }
    });

    const clientsWithIncome = clients.map((c) => ({
      ...c,
      totalIncome: incomeMap[c._id.toString()] || 0,
    }));

    return NextResponse.json(clientsWithIncome);
  } catch (err) {
    console.error("GET /api/clients error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch clients" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// POST create new client
export async function POST(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    // Normalize phone number
    let phoneNumber = "";
    try {
      phoneNumber = parsePhoneNumber(body.phone, "PK").number;
    } catch {
      return NextResponse.json(
        { message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check duplicate phone for this user
    const existingClient = await Client.findOne({ userId, phone: phoneNumber });
    if (existingClient) {
      return NextResponse.json(
        { message: "Phone number already in use for this user." },
        { status: 400 }
      );
    }

    const newClient = await Client.create({ ...body, phone: phoneNumber, userId });
    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST /api/clients error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create client" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
