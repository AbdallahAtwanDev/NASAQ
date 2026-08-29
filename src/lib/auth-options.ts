import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async signIn({ user, account }) {
      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nasaq.eg";
      if (account?.provider !== "credentials" && user.email === adminEmail) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? "CUSTOMER";
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
