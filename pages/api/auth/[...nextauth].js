import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Credentials received:", credentials);
        await connectToDB();
        console.log("✅ Connected to database");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password");
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email: credentials.email });
        console.log("🔍 User found:", user);

        if (!user) {
          console.log("❌ User not found");
          throw new Error("User not found");
        }

        if (user.role !== "admin" && user.role !== "superAdmin") {
          console.log("❌ Access denied for:", user.role);
          throw new Error("Access Denied! Admins only.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔍 Password valid:", isValid);

        if (!isValid) {
          console.log("❌ Invalid password");
          throw new Error("Invalid password");
        }

        console.log("✅ Login successful");
        return { id: user._id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXT_SECRET,
  pages: {
    signIn: "/login",
  },
});
