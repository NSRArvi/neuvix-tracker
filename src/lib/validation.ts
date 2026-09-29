/**
 * Zero-dependency, type-safe validation and sanitization helpers for production security.
 */

export function sanitizeString(val: unknown, fieldName: string, min = 1, max = 5000): string {
  if (typeof val !== "string") {
    throw new Error(`Invalid ${fieldName}: must be a text string.`);
  }
  const trimmed = val.trim();
  if (trimmed.length < min) {
    throw new Error(`${fieldName} cannot be empty.`);
  }
  if (trimmed.length > max) {
    throw new Error(`${fieldName} exceeds maximum allowed length of ${max} characters.`);
  }
  return trimmed;
}

export function sanitizeOptionalString(val: unknown, fieldName: string, max = 5000): string | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val !== "string") {
    throw new Error(`Invalid ${fieldName}: must be a text string.`);
  }
  const trimmed = val.trim();
  if (trimmed.length > max) {
    throw new Error(`${fieldName} exceeds maximum allowed length of ${max} characters.`);
  }
  return trimmed || null;
}

export function sanitizeUrl(val: unknown, fieldName: string): string {
  if (typeof val !== "string") {
    throw new Error(`Invalid ${fieldName}: must be a URL.`);
  }
  const trimmed = val.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`Invalid ${fieldName}: only http:// and https:// URLs are allowed.`);
    }
    return parsed.toString();
  } catch {
    throw new Error(`Invalid ${fieldName}: "${trimmed}" is not a valid web URL.`);
  }
}

export function sanitizeEnum<T extends string>(val: unknown, allowed: readonly T[], fieldName: string): T {
  if (typeof val !== "string" || !allowed.includes(val as T)) {
    throw new Error(`Invalid ${fieldName}: must be one of ${allowed.join(", ")}.`);
  }
  return val as T;
}

export function sanitizeId(val: unknown, fieldName: string): string {
  if (typeof val !== "string" || !val.trim()) {
    throw new Error(`Invalid ${fieldName}: identifier required.`);
  }
  const trimmed = val.trim();
  // Safe identifier check (UUID or alphanumeric ID)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new Error(`Invalid ${fieldName} format.`);
  }
  return trimmed;
}

export function sanitizeSafeRedirect(rawUrl: string | null | undefined, defaultUrl = "/dashboard"): string {
  if (!rawUrl || typeof rawUrl !== "string") return defaultUrl;
  const trimmed = rawUrl.trim();
  // Prevent open redirects: must start with single '/', not '//' or protocol
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
    return trimmed;
  }
  return defaultUrl;
}
