"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loadAvatar, saveAvatar, removeAvatar as removeAvatarStore } from "./avatarStore";

interface AvatarContextType {
  avatarUrl: string | null;
  setAvatar: (dataUrl: string) => void;
  removeAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setAvatarUrl(loadAvatar());
    setIsHydrated(true);
  }, []);

  const handleSetAvatar = (dataUrl: string) => {
    saveAvatar(dataUrl);
    setAvatarUrl(dataUrl);
  };

  const handleRemoveAvatar = () => {
    removeAvatarStore();
    setAvatarUrl(null);
  };

  // During SSR, return children without the provider to avoid hydration mismatch
  if (!isHydrated) {
    return <>{children}</>;
  }

  const value: AvatarContextType = {
    avatarUrl,
    setAvatar: handleSetAvatar,
    removeAvatar: handleRemoveAvatar,
  };

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
}

export function useAvatar(): AvatarContextType {
  const context = useContext(AvatarContext);

  if (!context) {
    return {
      avatarUrl: null,
      setAvatar: () => {},
      removeAvatar: () => {},
    };
  }

  return context;
}
