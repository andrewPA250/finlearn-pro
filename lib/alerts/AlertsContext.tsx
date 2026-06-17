"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PriceAlert, AlertType } from "./types";
import {
  loadAlerts,
  addAlert as addAlertStore,
  updateAlert as updateAlertStore,
  toggleAlert as toggleAlertStore,
  markTriggered as markTriggeredStore,
  removeAlert as removeAlertStore,
  clearAlerts as clearAlertsStore,
} from "./alertsStore";

interface AlertsContextType {
  alerts: PriceAlert[];
  isHydrated: boolean;
  addAlert: (symbol: string, type: AlertType, target: number, note?: string) => void;
  updateAlert: (id: string, type: AlertType, target: number, note?: string) => void;
  toggleAlert: (id: string) => void;
  markTriggered: (id: string) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setAlerts(loadAlerts());
    setIsHydrated(true);
  }, []);

  const value: AlertsContextType = {
    alerts,
    isHydrated,
    addAlert: (symbol, type, target, note) => {
      setAlerts(addAlertStore(symbol, type, target, note));
    },
    updateAlert: (id, type, target, note) => {
      setAlerts(updateAlertStore(id, type, target, note));
    },
    toggleAlert: (id) => {
      setAlerts(toggleAlertStore(id));
    },
    markTriggered: (id) => {
      setAlerts(markTriggeredStore(id));
    },
    removeAlert: (id) => {
      setAlerts(removeAlertStore(id));
    },
    clearAlerts: () => {
      clearAlertsStore();
      setAlerts([]);
    },
  };

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextType {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    return {
      alerts: [],
      isHydrated: false,
      addAlert: () => {},
      updateAlert: () => {},
      toggleAlert: () => {},
      markTriggered: () => {},
      removeAlert: () => {},
      clearAlerts: () => {},
    };
  }
  return ctx;
}
