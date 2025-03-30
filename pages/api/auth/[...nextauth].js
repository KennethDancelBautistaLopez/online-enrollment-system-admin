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

          // Load default admin and super admin credentials from environment variables
          const defaultSuperAdminEmail = process.env.DEFAULT_SUPERADMIN_EMAIL;
          const defaultSuperAdminPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD;
          const defaultSuperAdminRole = process.env.DEFAULT_SUPERADMIN_ROLE;

          const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
          const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
          const defaultAdminRole = process.env.DEFAULT_ADMIN_ROLE;

          // ✅ Check if Super Admin exists
          const existingSuperAdmin = await User.findOne({ role: "superAdmin" });

          // ✅ If no Super Admin exists, create one
          if (!existingSuperAdmin) {
            const hashedSuperAdminPassword = await bcrypt.hash(defaultSuperAdminPassword, 10);
            const defaultSuperAdmin = new User({
              email: defaultSuperAdminEmail,
              password: hashedSuperAdminPassword,
              role: defaultSuperAdminRole,
            });
            await defaultSuperAdmin.save();
            console.log("✅ Default Super Admin created");
          }

          // ✅ Check if Admin exists
          const existingAdmin = await User.findOne({ role: "admin" });

          // ✅ If no Admin exists, create one
          if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash(defaultAdminPassword, 10);
            const defaultAdmin = new User({
              email: defaultAdminEmail,
              password: hashedAdminPassword,
              role: defaultAdminRole,
            });
            await defaultAdmin.save();
            console.log("✅ Default Admin created");
          }

          // 🔍 Find the user trying to log in
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) {
            throw new Error("User not found");
          }

          // 🔐 Only allow admin or super admin users to log in
          if (user.role !== "admin" && user.role !== "superAdmin") {
            throw new Error("Access Denied! Admins only.");
          }

          // 🔑 Check password
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

export const config = {
  runtime: "nodejs",
};
