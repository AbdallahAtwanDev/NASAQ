const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  const content = fs.readFileSync(envPath, "utf8");
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!url || !key) {
    console.log(JSON.stringify({ ok: false, error: "Missing Supabase env vars" }));
    return;
  }

  const headers = {
    Authorization: `Bearer ${key}`,
    apikey: key,
    "Content-Type": "application/json",
  };

  const listRes = await fetch(`${url}/storage/v1/bucket`, { headers });
  const buckets = await listRes.json();
  console.log("Buckets status:", listRes.status);

  const exists = Array.isArray(buckets) && buckets.some((b) => b.id === "nasaq-uploads");

  if (!exists) {
    const createRes = await fetch(`${url}/storage/v1/bucket`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: "nasaq-uploads", name: "nasaq-uploads", public: true }),
    });
    const createBody = await createRes.text();
    console.log("Create bucket:", createRes.status, createBody);
  } else {
    console.log("Bucket nasaq-uploads already exists");
  }
}

main().catch((e) => console.error(e.message));
