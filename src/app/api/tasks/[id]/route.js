import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Task from "@/models/Task";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper: Check if a string is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: Get user ID from NextAuth session
const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// ---------------- DELETE Task ----------------
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!isValidId(id))
      return NextResponse.json(
        { error: true, message: "Invalid Task ID" },
        { status: 400 }
      );

    await dbConnect();
    const userId = await getUserIdFromSession();

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task)
      return NextResponse.json(
        { error: true, message: "Task not found" },
        { status: 404 }
      );

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json(
      { error: true, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// ---------------- UPDATE Task ----------------
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!isValidId(id))
      return NextResponse.json(
        { error: true, message: "Invalid Task ID" },
        { status: 400 }
      );

    await dbConnect();
    const userId = await getUserIdFromSession();
    const body = await req.json();

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true, runValidators: true }
    )
      .populate("sourceId", "name type")
      .populate({ path: "clientId", select: "name company email", strictPopulate: false })
      .lean();

    if (!updatedTask)
      return NextResponse.json(
        { error: true, message: "Task not found" },
        { status: 404 }
      );

    // Optional: add clientName for frontend display
    updatedTask.clientName = updatedTask.clientId
      ? updatedTask.clientId.company
        ? `${updatedTask.clientId.company} — ${updatedTask.clientId.name}`
        : updatedTask.clientId.name
      : "-";

    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error("PUT /api/tasks/[id] error:", err);
    return NextResponse.json(
      { error: true, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
