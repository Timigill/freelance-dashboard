import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Client from "@/models/Client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const getUserIdFromSession = async (req) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// GET single client
export async function GET(req, context) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession(req);
    const { slug } = context.params;

    const client = await Client.findOne({ _id: slug, userId });
    if (!client)
      return NextResponse.json({ message: "Client not found" }, { status: 404 });

    return NextResponse.json(client);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// UPDATE client
export async function PUT(req, context) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession(req);
    const { slug } = context.params;
    const body = await req.json();

    const updatedClient = await Client.findOneAndUpdate({ _id: slug, userId }, body, { new: true });
    if (!updatedClient)
      return NextResponse.json({ message: "Client not found" }, { status: 404 });

    return NextResponse.json(updatedClient);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Failed to update client" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// DELETE client
export async function DELETE(req, context) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession(req);
    const { slug } = context.params;

    const deleted = await Client.findOneAndDelete({ _id: slug, userId });
    if (!deleted)
      return NextResponse.json({ message: "Client not found" }, { status: 404 });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Failed to delete client" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
