import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Task from "@/models/Task";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// =========================
// 🗑 DELETE TASK
// =========================
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

    const deleted = await Task.findOneAndDelete({ _id: id, userId });

    if (!deleted)
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

// =========================
// ✏ UPDATE TASK
// =========================
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
      .populate({
        path: "clientId",
        select: "name company email",
      })
      .lean();

    if (!updatedTask)
      return NextResponse.json(
        { error: true, message: "Task not found" },
        { status: 404 }
      );

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
