import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(roles?: ("ADMIN" | "MAKER" | "CUSTOMER")[]) {
  const session = await getSession();
  if (!session?.user) throw new Error("غير مصرح");
  const role = session.user.role;
  if (roles && !roles.includes(role)) throw new Error("غير مصرح");
  return session.user;
}

export async function requireAdmin() {
  return requireAuth(["ADMIN"]);
}
