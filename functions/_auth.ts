export interface AuthEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
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
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;

  const response = await fetch(
    `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`,
    {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
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

export async function requireAdmin(request: Request, env: AuthEnv) {
  const user = await requireUser(request, env);
  if (!user) return null;
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
