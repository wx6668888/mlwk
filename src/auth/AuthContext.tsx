import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { track } from "../lib/analytics";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { flowType: "pkce", persistSession: true },
      })
    : null;

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  accessToken: string | null;
  signInWithGoogle: (locale: string, returnTo: string) => Promise<string | null>;
  signInWithX: (locale: string, returnTo: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string, locale: string) => Promise<string | null>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  sendOtp: (email: string) => Promise<string | null>;
  verifyOtp: (email: string, token: string) => Promise<string | null>;
  completeOtpSignUp: (password: string, firstName: string, lastName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(Boolean(supabase));
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAccessToken(data.session?.access_token ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: Boolean(supabase),
      loading,
      user,
      accessToken,
      signInWithGoogle: async (locale, returnTo) => {
        if (!supabase) return "Authentication is not configured.";
        track("login_started", { method: "google" });
        const callback = new URL(`/${locale}/auth/callback`, window.location.origin);
        callback.searchParams.set("returnTo", returnTo);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: callback.toString() },
        });
        return error?.message ?? null;
      },
      signInWithX: async (locale, returnTo) => {
        if (!supabase) return "Authentication is not configured.";
        track("login_started", { method: "x" });
        const callback = new URL(`/${locale}/auth/callback`, window.location.origin);
        callback.searchParams.set("returnTo", returnTo);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "x",
          options: { redirectTo: callback.toString() },
        });
        return error?.message ?? null;
      },
      signUpWithEmail: async (email, password, firstName, lastName, locale) => {
        if (!supabase) return "Authentication is not configured.";
        track("signup_started", { method: "email" });
        const redirectTo = new URL(`/${locale}/auth/callback`, window.location.origin);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: `${firstName} ${lastName}`.trim() },
            emailRedirectTo: redirectTo.toString(),
          },
        });
        return error?.message ?? null;
      },
      signInWithEmail: async (email, password) => {
        if (!supabase) return "Authentication is not configured.";
        track("login_started", { method: "email" });
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error) track("login_completed", { method: "email" });
        return error?.message ?? null;
      },
      sendOtp: async (email) => {
        if (!supabase) return "Authentication is not configured.";
        track("login_started", { method: "email_otp" });
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        return error?.message ?? null;
      },
      verifyOtp: async (email, token) => {
        if (!supabase) return "Authentication is not configured.";
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        if (!error) track("login_completed", { method: "email_otp" });
        return error?.message ?? null;
      },
      completeOtpSignUp: async (password, firstName, lastName) => {
        if (!supabase) return "Authentication is not configured.";
        const { error } = await supabase.auth.updateUser({
          password,
          data: { full_name: `${firstName} ${lastName}`.trim() },
        });
        return error?.message ?? null;
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [accessToken, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function authHeaders(accessToken: string | null): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
