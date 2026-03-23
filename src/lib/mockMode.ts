const STORAGE_KEY = "useMock";

export function isMockModeEnabled(): boolean {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_USE_MOCK === "true";
  }

  const local = window.localStorage.getItem(STORAGE_KEY);
  if (local !== null) return local === "true";

  return import.meta.env.VITE_USE_MOCK === "true";
}

export function setMockModeEnabled(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(value));
}
