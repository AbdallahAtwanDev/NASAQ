import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/sms";
import type { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.password) return null;
          const password = credentials.password;

          // Admin login by email
          if (credentials.email) {
            const email = credentials.email.trim().toLowerCase();
            const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@nasaq.eg")
              .trim()
              .toLowerCase();
            const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

            if (email !== adminEmail) return null;

            let user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  name: "مدير نسق",
                  email: adminEmail,
                  role: "ADMIN",
                  passwordHash: await bcrypt.hash(adminPassword, 12),
                },
              });
            } else if (user.role !== "ADMIN") {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
              });
            }

            const envMatch = password === adminPassword;
            const hashMatch = user.passwordHash
              ? await bcrypt.compare(password, user.passwordHash)
              : false;

            if (envMatch || hashMatch) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: "ADMIN" as Role,
              };
            }
            return null;
          }

          // Customer login by phone
          if (!credentials.phone) return null;

          const phone = normalizePhone(credentials.phone);
          const user = await prisma.user.findUnique({ where: { phone } });

          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "CUSTOMER";
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) token.role = dbUser.role;
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
