import { groups, totalAlgorithms, type AlgorithmGroup } from "../config";

interface LandingProps {
  onSelectAlgo: (groupId: string, algoId: string) => void;
  onSelectGroup: (groupId: string) => void;
}

function GroupCard({ group, onSelect, onSelectAlgo }: { group: AlgorithmGroup; onSelect: () => void; onSelectAlgo: (gid: string, aid: string) => void }) {
  return (
    <div
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onSelect}
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${group.color}80, transparent)` }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: `${group.color}15`, boxShadow: `0 0 20px ${group.color}10` }}
            >
              {group.icon}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white/90 tracking-tight">{group.name}</h3>
              <span className="text-[11px] text-white/25 tracking-wide">
                {group.algorithms.length} algorithm{group.algorithms.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="text-white/15 group-hover:text-white/40 transition-colors mt-1"
          >
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="text-[12.5px] text-white/30 leading-relaxed mb-5">{group.description}</p>

        {/* Algorithm pills */}
        <div className="flex flex-wrap gap-1.5">
          {group.algorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAlgo(group.id, algo.id);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition-all duration-150 border border-white/[0.04] hover:border-white/[0.08]"
            >
              {algo.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onSelectAlgo, onSelectGroup }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative px-6 md:px-12 pt-20 pb-16 max-w-6xl mx-auto">
        {/* Decorative elements */}
        <div className="absolute top-12 right-12 w-64 h-64 bg-amber-500/[0.03] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/[0.03] rounded-full blur-[60px] pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-bold text-black">
              A
            </div>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white/95 leading-[1.1] mb-4">
            Algo<span className="text-amber-500">Vault</span>
          </h1>
          <p className="text-lg md:text-xl text-white/30 max-w-xl leading-relaxed mb-2 font-light">
            Interactive algorithm & data structure visualizations.
            <br />
            <span className="text-white/20">Step through, understand, master.</span>
          </p>

          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] text-white/30">{totalAlgorithms} visualizations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[12px] text-white/30">{groups.length} categories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[12px] text-white/30">Step-by-step</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Groups Grid */}
      <div className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-[13px] font-semibold text-white/50 tracking-widest uppercase">
            Categories
          </h2>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onSelect={() => onSelectGroup(group.id)}
              onSelectAlgo={onSelectAlgo}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="h-px bg-white/[0.04] mb-6" />
        <div className="flex items-center justify-between text-[11px] text-white/15">
          <span>AlgoVault — Interactive DSA Visualizations</span>
          <span>Built for learning</span>
        </div>
      </div>
    </div>
  );
}
