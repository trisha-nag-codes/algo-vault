import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Landing from "./components/Landing";
import AlgoView from "./components/AlgoView";

interface NavState {
  view: "home" | "algo";
  groupId?: string;
  algoId?: string;
}

function parseHash(): NavState {
  const hash = window.location.hash.slice(1);
  if (!hash) return { view: "home" };
  const parts = hash.split("/");
  if (parts.length === 2) {
    return { view: "algo", groupId: parts[0], algoId: parts[1] };
  }
  return { view: "home" };
}

export default function App() {
  const [nav, setNav] = useState<NavState>(parseHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync with hash
  useEffect(() => {
    const handler = () => setNav(parseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigateTo = useCallback((state: NavState) => {
    if (state.view === "home") {
      window.location.hash = "";
    } else {
      window.location.hash = `${state.groupId}/${state.algoId}`;
    }
    setNav(state);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const goHome = useCallback(() => {
    navigateTo({ view: "home" });
  }, [navigateTo]);

  const selectAlgo = useCallback(
    (groupId: string, algoId: string) => {
      navigateTo({ view: "algo", groupId, algoId });
    },
    [navigateTo]
  );

  const selectGroup = useCallback(
    (_groupId: string) => {
      setSidebarOpen(true);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      {/* Background dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
          bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/80
          ${sidebarOpen ? "lg:opacity-0 lg:pointer-events-none" : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeAlgo={nav.algoId ?? null}
        onSelectAlgo={selectAlgo}
        onGoHome={goHome}
      />

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? "lg:ml-72" : "lg:ml-0"}`}
      >
        {nav.view === "home" ? (
          <Landing onSelectAlgo={selectAlgo} onSelectGroup={selectGroup} />
        ) : (
          <AlgoView groupId={nav.groupId!} algoId={nav.algoId!} onBack={goHome} />
        )}
      </main>
    </div>
  );
}
