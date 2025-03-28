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
        try {
          await connectToDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) {
            throw new Error("User not found");
          }

          if (user.role !== "admin" && user.role !== "superAdmin") {
            throw new Error("Access Denied! Admins only.");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return { id: user._id, email: user.email, role: user.role };
        } catch (error) {
          console.error("❌ Authentication error:", error);
          throw new Error(JSON.stringify({ message: error.message }));
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🔹 Assigning user to JWT token:", user);
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔹 Assigning token to session:", token);
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


export const config = {
  runtime: "nodejs",
};