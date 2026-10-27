import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User as NextAuthUser } from "next-auth";
import bcrypt from "bcryptjs";

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

          try {
            const [{ connectDB }, { User }] = await Promise.all([import("@/lib/db"), import("@/models/User")]);
            const ok = await connectDB();
            if (!ok) {
              const { findFallbackUserByEmail } = await import("@/lib/fallbackStore");
              const fallbackUser = await findFallbackUserByEmail(email);
              if (!fallbackUser) return null;
              const isValid = await bcrypt.compare(password, fallbackUser.password);
              if (!isValid) return null;
              return {
                id: fallbackUser.id,
                name: fallbackUser.name,
                email: fallbackUser.email,
                role: fallbackUser.role,
              } as NextAuthUser;
            }
            const user = await User.findOne({ email });
            if (!user) {
              const { findFallbackUserByEmail } = await import("@/lib/fallbackStore");
              const fallbackUser = await findFallbackUserByEmail(email);
              if (!fallbackUser) return null;
              const isValid = await bcrypt.compare(password, fallbackUser.password);
              if (!isValid) return null;
              return {
                id: fallbackUser.id,
                name: fallbackUser.name,
                email: fallbackUser.email,
                role: fallbackUser.role,
              } as NextAuthUser;
            }

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
            const { findFallbackUserByEmail } = await import("@/lib/fallbackStore");
            const fallbackUser = await findFallbackUserByEmail(email);
            if (!fallbackUser) return null;
            const isValid = await bcrypt.compare(password, fallbackUser.password);
            if (!isValid) return null;
            return {
              id: fallbackUser.id,
              name: fallbackUser.name,
              email: fallbackUser.email,
              role: fallbackUser.role,
            } as NextAuthUser;
          }
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

          try {
            const [{ connectDB }, { Admin }] = await Promise.all([import("@/lib/db"), import("@/models/Admin")]);
            const ok = await connectDB();
            if (!ok) {
              const { findFallbackAdminAccount } = await import("@/lib/seedAccounts");
              const fallback = findFallbackAdminAccount(email);
              if (fallback && fallback.password === password && fallback.securityKey === securityKey) {
                return {
                  id: fallback.email,
                  name: fallback.fullName,
                  email: fallback.email,
                  role: fallback.role,
                } as NextAuthUser;
              }
              return null;
            }
            const admin = await Admin.findOne({ email });
            if (!admin) {
              const { findFallbackAdminAccount } = await import("@/lib/seedAccounts");
              const fallback = findFallbackAdminAccount(email);
              if (fallback && fallback.password === password && fallback.securityKey === securityKey) {
                return {
                  id: fallback.email,
                  name: fallback.fullName,
                  email: fallback.email,
                  role: fallback.role,
                } as NextAuthUser;
              }
              return null;
            }
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
            const { findFallbackAdminAccount } = await import("@/lib/seedAccounts");
            const fallback = findFallbackAdminAccount(email);
            if (fallback && fallback.password === password && fallback.securityKey === securityKey) {
              return {
                id: fallback.email,
                name: fallback.fullName,
                email: fallback.email,
                role: fallback.role,
              } as NextAuthUser;
            }
            return null;
          }
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
