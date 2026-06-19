export const AVATAR_STORAGE_KEY = "financehub:avatar";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB
export const AVATAR_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type AvatarValidationError = "invalid_type" | "too_large";
