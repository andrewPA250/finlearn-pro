"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useAvatar } from "@/lib/avatar/AvatarContext";
import { useSettings } from "@/lib/settings/SettingsContext";
import { t } from "@/lib/settings/i18n";
import { validateAvatarFile, readAvatarFile } from "@/lib/avatar/avatarStore";
import { UserIcon } from "@/components/layout/icons";

interface AvatarUploadProps {
  initials: string;
}

export function AvatarUpload({ initials }: AvatarUploadProps) {
  const { avatarUrl, setAvatar, removeAvatar } = useAvatar();
  const { language } = useSettings();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayed = preview ?? avatarUrl;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError === "invalid_type") {
      setError(t("avatarErrorType", language));
      return;
    }
    if (validationError === "too_large") {
      setError(t("avatarErrorSize", language));
      return;
    }

    setError(null);
    readAvatarFile(file)
      .then(setPreview)
      .catch(() => setError(t("avatarErrorGeneric", language)));
  }

  function handleSave() {
    if (!preview) return;
    setAvatar(preview);
    setPreview(null);
  }

  function handleCancelPreview() {
    setPreview(null);
    setError(null);
  }

  function handleRemove() {
    removeAvatar();
    setPreview(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan/20 bg-cyan/10 text-xl font-bold text-cyan">
          {displayed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayed} alt="" className="h-full w-full object-cover" />
          ) : initials ? (
            initials
          ) : (
            <UserIcon className="h-6 w-6" />
          )}
        </span>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-card border border-bg-border/20 bg-bg-card/40 px-3 py-1.5 text-sm font-medium text-text-secondary transition duration-150 ease-in-out hover:border-cyan/30 hover:bg-bg-hover hover:text-text-primary"
            >
              {t("avatarUpload", language)}
            </button>
            {(avatarUrl || preview) && (
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-card border border-bg-border/20 px-3 py-1.5 text-sm font-medium text-negative transition duration-150 ease-in-out hover:bg-bg-hover"
              >
                {t("avatarRemove", language)}
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted">{t("avatarHint", language)}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {preview && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-card bg-cyan px-4 py-1.5 text-sm font-semibold text-bg-primary transition duration-150 ease-in-out hover:bg-cyan-dark"
          >
            {t("avatarSave", language)}
          </button>
          <button
            type="button"
            onClick={handleCancelPreview}
            className="rounded-card px-4 py-1.5 text-sm font-medium text-text-secondary transition duration-150 ease-in-out hover:bg-bg-hover"
          >
            {t("cancel", language)}
          </button>
        </div>
      )}
    </div>
  );
}
