import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import parsePhoneNumber from "libphonenumber-js";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrPhone: {
          label: "Email or Phone",
          type: "text",
          placeholder: "Email or Phone",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const { emailOrPhone, password } = credentials;
        let user;

        if (emailOrPhone.includes("@")) {
          const normalizedEmail = emailOrPhone.trim().toLowerCase();
          user = await User.findOne({
            email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
          });
        } else {
          try {
            const phoneNumber = parsePhoneNumber(emailOrPhone, "PK");
            if (!phoneNumber.isValid()) throw new Error("Invalid phone number format");
            user = await User.findOne({ phone: phoneNumber.number });
          } catch {
            throw new Error("Invalid phone number format");
          }
        }

        if (!user) throw new Error("User not found");
        if (!user.isVerified) throw new Error("Please verify your account first");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for App Router + production

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name || "No Name",
            email: user.email,
            isVerified: true,
            provider: account.provider,
          });
          console.log("✅ New OAuth user saved to DB:", user.email);
        } else {
          console.log("ℹ️ OAuth user already exists:", user.email);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) token.id = dbUser._id.toString();
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
