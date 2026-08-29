"use server";

import { getAllSettings } from "@/lib/settings";

export async function getPublicSettings() {
  return getAllSettings();
}
