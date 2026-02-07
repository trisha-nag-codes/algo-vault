import { Suspense } from "react";
import { groups } from "../config";

interface AlgoViewProps {
  groupId: string;
  algoId: string;
  onBack: () => void;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
        </div>
        <span className="text-[13px] text-white/30">Loading visualization…</span>
      </div>
    </div>
  );
}

export default function AlgoView({ groupId, algoId, onBack }: AlgoViewProps) {
  const group = groups.find((g) => g.id === groupId);
  const algo = group?.algorithms.find((a) => a.id === algoId);

  if (!group || !algo) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-3">Visualization not found</p>
          <button onClick={onBack} className="text-amber-500 text-sm hover:underline">
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const Component = algo.component;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb bar */}
      <div className="sticky top-0 z-10 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="px-6 py-3 flex items-center gap-2 text-[12.5px]">
          <button onClick={onBack} className="text-white/30 hover:text-white/60 transition-colors">
            Home
          </button>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/15">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white/30">{group.name}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/15">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white/60">{algo.name}</span>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-2 md:p-4">
        <Suspense fallback={<LoadingFallback />}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
}
