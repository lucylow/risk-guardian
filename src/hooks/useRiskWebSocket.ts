import { useEffect, useState } from "react";

interface HighRiskAlert {
  type: string;
  safety_score?: number;
  recommendation?: string;
}

export function useRiskWebSocket(userAddress: string) {
  const [updatedRisk, setUpdatedRisk] = useState<HighRiskAlert | null>(null);

  useEffect(() => {
    if (!userAddress) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://localhost:8000/ws/${userAddress}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "high_risk_alert" || data?.type === "risk_update") {
          setUpdatedRisk(data);
        }
      } catch (err) {
        console.error("WebSocket parse error", err);
      }
    };
    return () => ws.close();
  }, [userAddress]);

  return updatedRisk;
}
