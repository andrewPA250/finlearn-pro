import {
  AVATAR_STORAGE_KEY,
  AVATAR_MAX_BYTES,
  AVATAR_ALLOWED_TYPES,
  type AvatarValidationError,
} from "./types";

/**
 * Load the avatar data URL from localStorage, or null if unavailable.
 * SSR-safe: handles server/client execution gracefully.
 */
export function loadAvatar(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist the avatar data URL to localStorage.
 */
export function saveAvatar(dataUrl: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Remove the avatar from localStorage.
 */
export function removeAvatar(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  } catch {
    // Storage unavailable — silently fail
  }
}

/**
 * Validate a file against type/size rules before reading it.
 * Returns null if valid, or the specific error otherwise.
 */
export function validateAvatarFile(file: File): AvatarValidationError | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return "invalid_type";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "too_large";
  }
  return null;
}

/**
 * Read a validated file into a base64 data URL.
 */
export function readAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
