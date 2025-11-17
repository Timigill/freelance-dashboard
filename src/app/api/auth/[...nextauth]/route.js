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
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const { emailOrPhone, password } = credentials;
        let user;

        try {
          if (emailOrPhone.includes("@")) {
            const email = emailOrPhone.trim().toLowerCase();
            user = await User.findOne({
              email: { $regex: new RegExp(`^${email}$`, "i") },
            });
          } else {
            const phoneNumber = parsePhoneNumber(emailOrPhone, "PK");
            if (!phoneNumber.isValid()) throw new Error("Invalid phone number");
            user = await User.findOne({ phone: phoneNumber.number });
          }

          if (!user) throw new Error("User not found");
          if (!user.isVerified) throw new Error("Account not verified");

          const match = await bcrypt.compare(password, user.password);
          if (!match) throw new Error("Invalid password");

          // Return user data for JWT
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (err) {
          console.error("Authorize error:", err.message);
          return null; // NextAuth will handle error
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) return false; // must have email

        let exist = await User.findOne({ email: user.email });
        if (!exist) {
          const newUser = await User.create({
            name: user.name || "No Name",
            email: user.email,
            provider: account.provider,
            isVerified: true,
            password: null,
          });
          user.id = newUser._id.toString(); // set ID for JWT
        } else {
          user.id = exist._id.toString();
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
