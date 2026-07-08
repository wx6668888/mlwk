/**
 * Email validation utility — client-side format check + server-side verification.
 * Falls back to format-only check when the API endpoint is unreachable.
 */

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const COMMON_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "hotmail.con": "hotmail.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "icloud.con": "icloud.com",
};

export type EmailResult = {
  valid: boolean;
  reason?: string;
  suggestedEmail?: string;
};

export function validateEmailFormat(email: string): EmailResult {
  const trimmed = email.trim();

  if (!trimmed) return { valid: false, reason: "Email is required" };
  if (trimmed.length > 254) return { valid: false, reason: "Email is too long" };

  if (!EMAIL_RE.test(trimmed)) {
    return { valid: false, reason: "Please enter a valid email address" };
  }

  // Check common typos
  const domain = trimmed.split("@")[1].toLowerCase();
  const suggested = COMMON_TYPOS[domain];
  if (suggested) {
    return {
      valid: false,
      reason: `Did you mean ...@${suggested}?`,
      suggestedEmail: trimmed.replace(domain, suggested),
    };
  }

  return { valid: true };
}

export async function verifyEmail(email: string): Promise<EmailResult> {
  // Always do format check first (instant)
  const formatResult = validateEmailFormat(email);
  if (!formatResult.valid) return formatResult;

  // Try server-side verification
  try {
    const resp = await fetch("/api/validate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = (await resp.json()) as EmailResult & {
      suggestedDomain?: string;
    };
    if (!data.valid && data.suggestedDomain) {
      const domain = email.trim().split("@")[1];
      return {
        valid: false,
        reason: data.reason,
        suggestedEmail: email.trim().replace(domain, data.suggestedDomain),
      };
    }
    return data;
  } catch {
    // Server unavailable — accept format-valid emails
    return { valid: true };
  }
}
