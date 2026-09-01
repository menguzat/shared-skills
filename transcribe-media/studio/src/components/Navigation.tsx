import React from 'react';
import { Library, Mic, Network, Users, Radio } from 'lucide-react';
import { Catalog } from '../types';

export type ViewTab = 'library' | 'studio' | 'graph' | 'entities';

interface NavigationProps {
  catalog: Catalog | null;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  incidentCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  catalog,
  activeTab,
  onTabChange,
  incidentCount,
}) => {
  const convCount = catalog?.conversations?.length || 0;
  const entityCount = catalog?.entities?.length || 0;
  const relCount = catalog?.relations?.length || 0;

  return (
    <header className="bg-panel border-b border-borderSubtle px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
      {/* Brand */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-accent uppercase mb-1">
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#f59e0b]"></span>
          <span>LYF.LAB / CONVERSATION INTELLIGENCE</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-100 flex items-center gap-2">
          Field Knowledge &amp; Speaker Studio
        </h1>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-borderSubtle">
        <button
          onClick={() => onTabChange('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'library'
              ? 'bg-canvas text-gray-100 shadow-md border border-borderMedium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-cardHover'
          }`}
        >
          <Library className="w-4 h-4 text-blue-400" />
          <span>Library</span>
        </button>

        <button
          onClick={() => onTabChange('studio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'studio'
              ? 'bg-canvas text-gray-100 shadow-md border border-borderMedium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-cardHover'
          }`}
        >
          <Mic className="w-4 h-4 text-accent" />
          <span>Speaker Studio</span>
          {incidentCount > 0 && (
            <span className="bg-accent text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {incidentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'graph'
              ? 'bg-canvas text-gray-100 shadow-md border border-borderMedium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-cardHover'
          }`}
        >
          <Network className="w-4 h-4 text-purple-400" />
          <span>Knowledge Graph</span>
        </button>

        <button
          onClick={() => onTabChange('entities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'entities'
              ? 'bg-canvas text-gray-100 shadow-md border border-borderMedium'
              : 'text-gray-400 hover:text-gray-200 hover:bg-cardHover'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Entities &amp; Roster</span>
        </button>
      </nav>

      {/* Stats Counter */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end px-3 py-1 bg-card rounded-lg border border-borderSubtle">
          <strong className="text-sm font-bold text-gray-100">{convCount}</strong>
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Conversations</span>
        </div>
        <div className="flex flex-col items-end px-3 py-1 bg-card rounded-lg border border-borderSubtle">
          <strong className="text-sm font-bold text-gray-100">{entityCount}</strong>
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Entities</span>
        </div>
        <div className="flex flex-col items-end px-3 py-1 bg-card rounded-lg border border-borderSubtle">
          <strong className="text-sm font-bold text-gray-100">{relCount}</strong>
          <span className="text-[9px] uppercase tracking-wider text-gray-400">Relations</span>
        </div>
        <div className="flex flex-col items-end px-3 py-1 bg-card rounded-lg border border-borderSubtle">
          <strong className="text-sm font-bold text-accent">{incidentCount}</strong>
          <span className="text-[9px] uppercase tracking-wider text-accent">In Review</span>
        </div>
      </div>
    </header>
  );
};
