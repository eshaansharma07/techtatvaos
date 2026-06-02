import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "tech-tatva-local-development-only" : undefined),
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email, status: "active" })
          .select("+passwordHash")
          .populate("role");

        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role?.slug || "student_visitor"
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role || "student_visitor";
        token.sub = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      (session.user as typeof session.user & { role?: string }).role = String(
        token.role || "student_visitor"
      );
      (session.user as typeof session.user & { id?: string }).id = String(token.sub || "");
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/admin`;
    }
  }
});
