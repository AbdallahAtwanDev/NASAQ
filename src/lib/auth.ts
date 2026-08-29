import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
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
