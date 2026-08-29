import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const providers: NextAuthOptions["providers"] = [];

const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (googleId && googleSecret && googleId.length > 5) {
  providers.push(
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nasaq.eg";
      const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

      if (
        credentials.email === adminEmail &&
        credentials.password === adminPassword
      ) {
        let admin = await prisma.user.findUnique({
          where: { email: adminEmail },
        });

        if (!admin) {
          admin = await prisma.user.create({
            data: {
              name: "مدير نسق",
              email: adminEmail,
              role: "ADMIN",
              passwordHash: await bcrypt.hash(adminPassword, 12),
            },
          });
        } else if (admin.role !== "ADMIN") {
          admin = await prisma.user.update({
            where: { id: admin.id },
            data: { role: "ADMIN" },
          });
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "ADMIN" as Role,
        };
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(
        credentials.password,
        user.passwordHash
      );
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  providers,
  callbacks: {
    async signIn({ user, account }) {
      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nasaq.eg";
      if (account?.provider !== "credentials" && user.email === adminEmail) {
        return false;
      }

      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: user.name ?? "مستخدم",
              email: user.email,
              image: user.image,
              role: "CUSTOMER",
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else if (user.id) {
          token.id = user.id;
          token.role = (user as { role?: Role }).role ?? "CUSTOMER";
        }
      }

      if (account && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};
