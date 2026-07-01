import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User as NextAuthUser } from "next-auth";

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const bcrypt = require("bcryptjs") as {
            compare(s: string, hash: string): Promise<boolean>;
          };
          const { connectDB } = await import("@/lib/db");
          const { User } = await import("@/models/User");

          await connectDB();
          const user = await User.findOne({ email });
          if (!user) return null;

          const hash: string = String(user.get("password"));
          const isValid = await bcrypt.compare(password, hash);
          if (!isValid) return null;

          return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: (user as any).role,
          } as NextAuthUser;
        } catch {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        securityKey: { label: "Security Key", type: "text" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          const securityKey = credentials?.securityKey as string | undefined;
          if (!email || !password || !securityKey) return null;

          const bcrypt = require("bcryptjs") as {
            compare(s: string, hash: string): Promise<boolean>;
          };
          const { connectDB } = await import("@/lib/db");
          const { Admin } = await import("@/models/Admin");

          await connectDB();
          const admin = await Admin.findOne({ email });
          if (!admin) return null;
          if (!(admin as any).isActive) return null;

          const pw: string = String((admin as any).password);
          const isValid = await bcrypt.compare(password, pw);
          if (!isValid) return null;

          const key: string = String((admin as any).securityKey);
          const isKeyValid = await bcrypt.compare(securityKey, key);
          if (!isKeyValid) return null;

          await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

          return {
            id: String(admin._id),
            name: (admin as any).fullName,
            email: (admin as any).email,
            role: (admin as any).role,
          } as NextAuthUser;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handlers, auth, signIn, signOut };
