import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Client from "@/models/Client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { parsePhoneNumber } from "libphonenumber-js";

// Helper to get user ID from NextAuth session
const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
};

// GET single client
export async function GET(req, context) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const params = await context.params;
    const slug = params.slug;

    const client = await Client.findOne({ _id: slug, userId });
    if (!client)
      return NextResponse.json({ message: "Client not found" }, { status: 404 });

    return NextResponse.json(client);
  } catch (err) {
    console.error("GET /api/clients/[slug] error:", err);
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// PUT edit client
export async function PUT(req, context) {
  try {
    await dbConnect();
    const userId = await getUserIdFromSession();

    const params = await context.params;
    const slug = params.slug;

    const body = await req.json();
    console.log("PUT request for client:", slug, body);

    // Normalize phone number
    let phoneNumber = "";
    try {
      let rawPhone = body.phone || "";
      if (!rawPhone.startsWith("+")) rawPhone = "+92" + rawPhone.replace(/^0/, "");
      phoneNumber = parsePhoneNumber(rawPhone).number;
    } catch (err) {
      console.error("Phone parsing error:", err);
      return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 });
    }

    // Check for duplicate phone
    const existingClient = await Client.findOne({
      userId,
      phone: phoneNumber,
      _id: { $ne: slug },
    });
    if (existingClient) {
      return NextResponse.json({ message: "Phone number already in use for this user." }, { status: 400 });
    }

    // Update client
    const updatedClient = await Client.findOneAndUpdate(
      { _id: slug, userId },
      { ...body, phone: phoneNumber },
      { new: true }
    );

    if (!updatedClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updatedClient);
  } catch (err) {
    console.error("PUT /api/clients/[slug] error:", err);
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
    const userId = await getUserIdFromSession();

    const params = await context.params;
    const slug = params.slug;

    if (!slug) {
      console.error("DELETE called without slug!");
      return NextResponse.json({ message: "Missing client ID" }, { status: 400 });
    }

    console.log("Deleting client with slug:", slug);

    const deleted = await Client.findOneAndDelete({ _id: slug, userId });
    if (!deleted) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/clients/[slug] error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete client" },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
