"use server";

import { requireAdmin } from "@/lib/auth";
import { getAllSettings, upsertSettings } from "@/lib/settings";
import { uploadFile } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getAdminSettings() {
  await requireAdmin();
  return getAllSettings();
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();

  const data: Record<string, string> = {
    vodafone_cash: (formData.get("vodafone_cash") as string) || "",
    instapay_handle: (formData.get("instapay_handle") as string) || "",
    contact_phone: (formData.get("contact_phone") as string) || "",
    contact_email: (formData.get("contact_email") as string) || "",
    contact_whatsapp: (formData.get("contact_whatsapp") as string) || "",
    facebook_url: (formData.get("facebook_url") as string) || "",
    instagram_url: (formData.get("instagram_url") as string) || "",
    hero_title: (formData.get("hero_title") as string) || "",
    hero_subtitle: (formData.get("hero_subtitle") as string) || "",
    admin_notification_email: (formData.get("admin_notification_email") as string) || "",
  };

  const qrFile = formData.get("instapay_qr") as File | null;
  if (qrFile && qrFile.size > 0) {
    data.instapay_qr_url = await uploadFile(
      "nasaq-uploads",
      `settings/instapay-qr-${Date.now()}.${qrFile.name.split(".").pop()}`,
      qrFile
    );
  } else {
    const currentQr = formData.get("current_instapay_qr") as string;
    if (currentQr) data.instapay_qr_url = currentQr;
  }

  await upsertSettings(data);
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
  return { success: true };
}
