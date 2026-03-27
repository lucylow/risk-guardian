/**
 * useOracleEvents — subscribes to simulated on-chain RiskScoreUpdated events.
 */

import { useState, useEffect, useRef } from "react";
import { subscribeToRiskEvents } from "@/blockchain/oracleClient";
import type { RiskScoreEvent } from "@/blockchain/types";

export function useOracleEvents(maxEvents = 10) {
  const [events, setEvents] = useState<RiskScoreEvent[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = subscribeToRiskEvents((event) => {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents));
    });
    return () => unsubRef.current?.();
  }, [maxEvents]);

  return events;
}
