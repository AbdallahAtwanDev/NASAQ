const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const content = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const buffer = Buffer.from("nasaq-test");
  const filePath = `test/setup-${Date.now()}.txt`;

  const { error } = await supabase.storage.from("nasaq-uploads").upload(filePath, buffer, {
    contentType: "text/plain",
    upsert: true,
  });

  if (error) {
    console.log(JSON.stringify({ ok: false, error: error.message }));
    return;
  }

  const { data } = supabase.storage.from("nasaq-uploads").getPublicUrl(filePath);
  console.log(JSON.stringify({ ok: true, url: data.publicUrl }));
}

main();
