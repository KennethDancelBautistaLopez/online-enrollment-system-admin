import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Generate JWT for authenticated users
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role }, // Include user role
    process.env.JWT_SECRET, // Use secret from .env
    { expiresIn: "7d" } // Token valid for 7 days
  );
};

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
        await connectToDB();

        // console.log("🔍 Received credentials:", credentials);

        if (!credentials || !credentials.email || !credentials.password) {
          // console.log("❌ Missing email or password");
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email: credentials.email });

        // console.log("🔍 Found user:", user);

        if (!user) {
          // console.log("❌ User not found");
          throw new Error("User not found");
        }

        if (user.role !== "admin" && user.role !== "superAdmin") {
          // console.log("❌ Access denied for:", user.role);
          throw new Error("Access Denied! Admins only.");
        }

        // console.log("🔍 Comparing passwords...");
        const isValid = await bcrypt.compare(credentials.password, user.password);

        // console.log("🔍 Password valid:", isValid);

        if (!isValid) {
          // console.log("❌ Invalid password");
          throw new Error("Invalid password");
        }

        const token = generateToken(user);

        // console.log("✅ Login successful");

        return { id: user._id, email: user.email, role: user.role, token  };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // console.log("🛠 JWT Callback - Before:", token);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.token = user.token;
      }
      // console.log("✅ JWT Callback - After:", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("🛠 Session Callback:", { session, token });
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.token = token.token;
      
      return session;
    },
  },
  secret: process.env.NEXT_SECRET,
  pages: {
    signIn: "/login", // Redirect to login page if not authenticated
  },
});
