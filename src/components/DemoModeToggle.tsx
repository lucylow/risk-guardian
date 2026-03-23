interface DemoModeToggleProps {
  isMock: boolean;
  onToggle: () => void;
}

export default function DemoModeToggle({ isMock, onToggle }: DemoModeToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-2 z-50">
      <span className="text-sm text-gray-600">Demo Mode</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isMock ? "bg-indigo-600" : "bg-gray-300"
        }`}
        aria-label="Toggle demo mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isMock ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-xs text-gray-500">{isMock ? "Mock" : "Live"}</span>
    </div>
  );
}
