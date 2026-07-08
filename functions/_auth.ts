export interface AuthEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  ADMIN_USER_IDS?: string;
}

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export async function requireUser(
  request: Request,
  env: AuthEnv,
): Promise<AuthUser | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const response = await fetch(
    `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: authorization,
      },
    },
  );
  if (!response.ok) return null;
  return (await response.json()) as AuthUser;
}

export function unauthorized() {
  return Response.json({ error: "Authentication required." }, { status: 401 });
}

// Built-in admin IDs — used when ADMIN_USER_IDS env var is not set.
// Move these to ADMIN_USER_IDS in Cloudflare once you have admin access.
const BUILT_IN_ADMINS = new Set([
  "762b1780-f52c-4543-a328-5397c8d99c46",
]);

export async function requireAdmin(request: Request, env: AuthEnv) {
  const user = await requireUser(request, env);
  if (!user) return null;
  if (BUILT_IN_ADMINS.has(user.id)) return user;
  const allowed = new Set(
    (env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return allowed.has(user.id) ? user : null;
}

export function forbidden() {
  return Response.json(
    { error: "Administrator access required." },
    { status: 403 },
  );
}
