import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // Set the JWT session lifetime (2 hours)
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectToDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Load default admin and super admin credentials from environment variables
          const {
            DEFAULT_SUPERADMIN_EMAIL,
            DEFAULT_SUPERADMIN_PASSWORD,
            DEFAULT_SUPERADMIN_ROLE,
            DEFAULT_ADMIN_EMAIL,
            DEFAULT_ADMIN_PASSWORD,
            DEFAULT_ADMIN_ROLE,
          } = process.env;

          if (
            !DEFAULT_SUPERADMIN_EMAIL ||
            !DEFAULT_SUPERADMIN_PASSWORD ||
            !DEFAULT_SUPERADMIN_ROLE ||
            !DEFAULT_ADMIN_EMAIL ||
            !DEFAULT_ADMIN_PASSWORD ||
            !DEFAULT_ADMIN_ROLE
          ) {
            throw new Error(
              "Missing required environment variables for default admin creation"
            );
            // if (
            //   !DEFAULT_SUPERADMIN_EMAIL ||
            //   !DEFAULT_SUPERADMIN_PASSWORD ||
            //   !DEFAULT_SUPERADMIN_ROLE ||
            //   !DEFAULT_ADMIN_EMAIL ||
            //   !DEFAULT_ADMIN_PASSWORD ||
            //   !DEFAULT_ADMIN_ROLE
            // ) {
            //   throw new Error(
            //     "Missing required environment variables for default admin creation"
            //   );
          }

          // ✅ Check if Super Admin exists, create if not
          const existingSuperAdmin = await User.findOne({ role: "superAdmin" });
          if (!existingSuperAdmin) {
            const hashedSuperAdminPassword = await bcrypt.hash(
              DEFAULT_SUPERADMIN_PASSWORD,
              10
            );
            // const hashedSuperAdminPassword = await bcrypt.hash(
            //   DEFAULT_SUPERADMIN_PASSWORD,
            //   10
            // );
            const defaultSuperAdmin = new User({
              email: DEFAULT_SUPERADMIN_EMAIL,
              password: hashedSuperAdminPassword,
              role: DEFAULT_SUPERADMIN_ROLE,
            });
            await defaultSuperAdmin.save();
            console.log("✅ Default Super Admin created");
          }

          // ✅ Check if Admin exists, create if not
          const existingAdmin = await User.findOne({ role: "admin" });
          if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash(
              DEFAULT_ADMIN_PASSWORD,
              10
            );
            // const hashedAdminPassword = await bcrypt.hash(
            //   DEFAULT_ADMIN_PASSWORD,
            //   10
            // );
            const defaultAdmin = new User({
              email: DEFAULT_ADMIN_EMAIL,
              password: hashedAdminPassword,
              role: DEFAULT_ADMIN_ROLE,
            });
            await defaultAdmin.save();
            console.log("✅ Default Admin created");
          }

          // 🔍 Find the user trying to log in
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          });
          // const user = await User.findOne({
          //   email: credentials.email.toLowerCase(),
          // });
          if (!user) {
            throw new Error("User not found");
          }

          // 🔐 Only allow admin or super admin users to log in
          if (
            user.role !== "admin" &&
            user.role !== "superAdmin" &&
            user.role !== "registrar" &&
            user.role !== "accountant" &&
            user.role !== "programHeads"
          ) {
            throw new Error("Access Denied! Admins only.");
          }

          // 🔑 Check password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          // const isValid = await bcrypt.compare(
          //   credentials.password,
          //   user.password
          // );
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return user object with id, email, and role
          return { id: user._id, email: user.email, role: user.role };
        } catch (error) {
          console.error("❌ Authentication error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.id;
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
  secret: process.env.NEXTAUTH_SECRET,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Customize the sign-in page URL if necessary
  },
});

export const config = {
  runtime: "nodejs", // Ensures the code runs in a Node.js runtime
};
