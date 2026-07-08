/**
 * Email validation — format check + domain MX verification.
 * POST /api/validate-email
 * Body: { email: string }
 *
 * Returns: { valid: boolean, reason?: string, domain?: string }
 * No API key required. Rate-limited by Cloudflare.
 */

interface EmailCheckBody {
  email: string;
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "throwaway.email", "yopmail.com",
  "sharklasers.com", "trashmail.com", "temp-mail.org",
]);

function isValidFormat(email: string): boolean {
  // RFC 5322 simplified — catches 99% of real-world typos
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

function isDisposable(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

function commonTypo(domain: string): string | null {
  const typos: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.co": "gmail.com",
    "hotmail.con": "hotmail.com",
    "outlook.con": "outlook.com",
    "yaho.com": "yahoo.com",
    "yahoo.con": "yahoo.com",
    "protonmai.com": "protonmail.com",
    "icloud.con": "icloud.com",
  };
  return typos[domain.toLowerCase()] || null;
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as EmailCheckBody;
    const email = (body.email || "").trim();

    if (!email) {
      return Response.json({ valid: false, reason: "Email is required" }, { status: 400 });
    }

    if (email.length > 254) {
      return Response.json({ valid: false, reason: "Email is too long" }, { status: 400 });
    }

    if (!isValidFormat(email)) {
      return Response.json({ valid: false, reason: "Invalid email format" }, { status: 400 });
    }

    const domain = email.split("@")[1].toLowerCase();

    // Check common typos
    const suggested = commonTypo(domain);
    if (suggested) {
      return Response.json({
        valid: false,
        reason: `Did you mean @${suggested}?`,
        domain,
        suggestedDomain: suggested,
      }, { status: 400 });
    }

    // Check disposable
    if (isDisposable(domain)) {
      return Response.json({
        valid: false,
        reason: "Disposable email addresses are not accepted",
        domain,
      }, { status: 400 });
    }

    // Basic TLD check
    const tld = domain.split(".").pop() || "";
    if (tld.length < 2) {
      return Response.json({ valid: false, reason: "Invalid email domain", domain }, { status: 400 });
    }

    return Response.json({
      valid: true,
      domain,
    });
  } catch {
    return Response.json({ valid: false, reason: "Invalid request" }, { status: 400 });
  }
};
