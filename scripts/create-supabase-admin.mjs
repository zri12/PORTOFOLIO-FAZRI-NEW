import { createClient } from "@supabase/supabase-js";
import { loadAdminEnv } from "./load-admin-env.mjs";

loadAdminEnv();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_AUTH_EMAIL"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const username = process.env.ADMIN_USERNAME.trim();
const email = process.env.ADMIN_AUTH_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

try {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        display_name: "Fazri L.",
        role: "owner",
      },
    });
    if (error) throw error;
    user = data.user;
  }

  if (!user?.id) throw new Error("Supabase Auth did not return a user ID.");

  const { error: adminError } = await supabase.from("admin_users").upsert({
    user_id: user.id,
    username,
    display_name: "Fazri L.",
    role: "owner",
    active: true,
  }, { onConflict: "user_id" });

  if (adminError) throw adminError;
  console.log(`Admin user ready: ${username} (${email})`);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (error && typeof error === "object") {
    const details = ["message", "error", "code", "hint", "details", "name"]
      .map((key) => [key, error[key]])
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${String(value)}`);
    console.error(details.length ? details.join("\n") : JSON.stringify(error));
  } else {
    console.error("Failed to provision admin user.");
  }
  process.exit(1);
}
