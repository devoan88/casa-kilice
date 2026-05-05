"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { DeliveryZone } from "@/lib/shipping";

const STORAGE_KEY = "ck_delivery_zone";

type Ctx = {
  zone: DeliveryZone;
  setZone: (z: DeliveryZone) => void;
};

const DeliveryZoneContext = createContext<Ctx | null>(null);

function isZone(raw: string | null): raw is DeliveryZone {
  return raw === "intl" || raw === "ge_tbilisi" || raw === "ge_region";
}

export function DeliveryZoneProvider({ children }: { children: React.ReactNode }) {
  const [zone, setZoneState] = useState<DeliveryZone>("intl");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw === "ge") {
        setZoneState("ge_tbilisi");
        sessionStorage.setItem(STORAGE_KEY, "ge_tbilisi");
        return;
      }
      if (isZone(raw)) setZoneState(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setZone = useCallback((z: DeliveryZone) => {
    setZoneState(z);
    try {
      sessionStorage.setItem(STORAGE_KEY, z);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ zone, setZone }), [zone, setZone]);

  return (
    <DeliveryZoneContext.Provider value={value}>
      {children}
    </DeliveryZoneContext.Provider>
  );
}

export function useDeliveryZone() {
  const ctx = useContext(DeliveryZoneContext);
  if (!ctx) {
    throw new Error("useDeliveryZone must be used within DeliveryZoneProvider");
  }
  return ctx;
}
