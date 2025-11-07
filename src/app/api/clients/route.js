import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Client from "@/models/Client";
import IncomeSource from "@/models/IncomeSource";

// ✅ CREATE a new client
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const newClient = await Client.create(body);
    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST /api/clients error:", err);
    return NextResponse.json(
      { message: "Failed to create client" },
      { status: 500 }
    );
  }
}

// ✅ GET all clients with income data
export async function GET() {
  try {
    await dbConnect();
    const clients = await Client.find().lean();

    const clientIds = clients.map((c) => c._id);
    const incomeSources = await IncomeSource.find({
      clientId: { $in: clientIds },
      isActive: true,
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
      { message: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
