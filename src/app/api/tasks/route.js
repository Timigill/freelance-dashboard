import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Task from "@/models/Task";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const castObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// =========================
// 🚀 GET TASKS
// =========================
export async function GET(request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const { searchParams } = new URL(request.url);
    const query = { userId };

    // Filter by month/year
    if (searchParams.has("month") && searchParams.has("year")) {
      const month = Number(searchParams.get("month"));
      const year = Number(searchParams.get("year"));

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.dueDate = { $gte: start, $lte: end };
    }

    // Filter by clientId
    if (searchParams.has("clientId")) {
      const id = castObjectId(searchParams.get("clientId"));
      if (id) query.clientId = id;
    }

    // Filter by status
    if (searchParams.has("status") && searchParams.get("status") !== "all") {
      query.status = searchParams.get("status");
    }

    // Filter by payment status
    if (
      searchParams.has("paymentStatus") &&
      searchParams.get("paymentStatus") !== "all"
    ) {
      query.paymentStatus = searchParams.get("paymentStatus");
    }

    const tasks = await Task.find(query)
      .populate({
        path: "clientId",
        select: "name company email",
      })
      .sort({ dueDate: 1 })
      .lean();

    const formatted = tasks.map((task) => ({
      ...task,
      clientName: task.clientId
        ? task.clientId.company
          ? `${task.clientId.company} — ${task.clientId.name}`
          : task.clientId.name
        : "-",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: true, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// =========================
// 🚀 POST TASK
// =========================
export async function POST(request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const body = await request.json();

    const { name, dueDate, amount, clientId } = body;

    if (!name || !dueDate || !amount || !clientId) {
      return NextResponse.json(
        {
          error: true,
          message: "name, amount, dueDate, and clientId are required",
        },
        { status: 400 }
      );
    }

    const task = await Task.create({ ...body, userId });

    await task.populate({
      path: "clientId",
      select: "name company email",
    });

    const formatted = {
      ...task.toObject(),
      clientName: task.clientId
        ? task.clientId.company
          ? `${task.clientId.company} — ${task.clientId.name}`
          : task.clientId.name
        : "-",
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json(
      { error: true, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
