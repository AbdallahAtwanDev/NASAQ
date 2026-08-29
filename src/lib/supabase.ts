import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const admin = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
