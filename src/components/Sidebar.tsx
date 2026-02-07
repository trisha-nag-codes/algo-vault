import { useState } from "react";
import { groups, type AlgorithmGroup } from "../config";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeAlgo: string | null;
  onSelectAlgo: (groupId: string, algoId: string) => void;
  onGoHome: () => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path
        d="M5.25 3.5L8.75 7L5.25 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar({
  isOpen,
  onToggle,
  activeAlgo,
  onSelectAlgo,
  onGoHome,
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/[0.06]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-0 lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-black">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-white/90 tracking-tight leading-tight">
                AlgoVault
              </span>
              <span className="text-[10px] text-white/30 tracking-wider uppercase">
                Visual DSA
              </span>
            </div>
          </button>
          <button
            onClick={onToggle}
            className="ml-auto lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          <button
            onClick={onGoHome}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] mb-1 transition-all duration-150
              ${!activeAlgo ? "bg-white/[0.06] text-white" : "text-white/50 hover:text-white/70 hover:bg-white/[0.03]"}`}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5L1.5 6.5V13.5H5.5V9.5H9.5V13.5H13.5V6.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            Home
          </button>

          <div className="h-px bg-white/[0.06] my-2 mx-2" />

          {groups.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? false;
            const hasActiveChild = group.algorithms.some((a) => a.id === activeAlgo);

            return (
              <div key={group.id} className="mb-0.5">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150
                    ${hasActiveChild ? "text-white/90" : "text-white/45 hover:text-white/70 hover:bg-white/[0.03]"}`}
                >
                  <span className="text-sm w-5 text-center flex-shrink-0">{group.icon}</span>
                  <span className="text-[13px] font-medium flex-1 truncate">{group.name}</span>
                  <span className="text-[10px] text-white/20 mr-0.5">{group.algorithms.length}</span>
                  <ChevronIcon open={isExpanded || hasActiveChild} />
                </button>

                {(isExpanded || hasActiveChild) && (
                  <div className="ml-5 pl-3 border-l border-white/[0.06] mt-0.5 mb-1.5">
                    {group.algorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => onSelectAlgo(group.id, algo.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-[12.5px] transition-all duration-150 block
                          ${activeAlgo === algo.id
                            ? "text-white bg-white/[0.08]"
                            : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                          }`}
                      >
                        {algo.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex-shrink-0">
          <div className="text-[10px] text-white/20 tracking-wide">
            27 INTERACTIVE VISUALIZATIONS
          </div>
        </div>
      </aside>
    </>
  );
}
