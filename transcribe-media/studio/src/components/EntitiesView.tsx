import React, { useState } from 'react';
import { Users, Search, Play, Tag, Building2, User } from 'lucide-react';
import { Catalog, Entity, Conversation } from '../types';

interface EntitiesViewProps {
  catalog: Catalog;
  onOpenConversation: (convId: string) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  catalog,
  onOpenConversation,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(
    catalog.entities && catalog.entities.length > 0 ? catalog.entities[0] : null
  );

  const filtered = (catalog.entities || []).filter((ent) => {
    if (typeFilter && ent.type !== typeFilter) return false;
    if (search && !ent.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const connectedConvs = selectedEntity
    ? (catalog.conversations || []).filter((c) =>
        [...(c.personIds || []), ...(c.projectIds || [])].includes(selectedEntity.id)
      )
    : [];

  const connectedRels = selectedEntity
    ? (catalog.relations || []).filter(
        (r) => r.sourceId === selectedEntity.id || r.targetId === selectedEntity.id
      )
    : [];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden h-[calc(100vh-140px)]">
      {/* Entity List (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
        <div className="bg-panel p-4 rounded-xl border border-borderSubtle flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-borderSubtle rounded-lg pl-9 pr-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === ''
                  ? 'bg-accent text-black font-bold'
                  : 'bg-card text-gray-400 hover:text-white'
              }`}
            >
              All ({catalog.entities?.length || 0})
            </button>
            <button
              onClick={() => setTypeFilter('person')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'person'
                  ? 'bg-accent text-black font-bold'
                  : 'bg-card text-gray-400 hover:text-white'
              }`}
            >
              People
            </button>
            <button
              onClick={() => setTypeFilter('project')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'project'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-card text-gray-400 hover:text-white'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((ent) => {
            const isSelected = selectedEntity?.id === ent.id;
            return (
              <div
                key={ent.id}
                onClick={() => setSelectedEntity(ent)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                  isSelected
                    ? 'bg-cardActive border-accent shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-card border-borderSubtle hover:bg-cardHover hover:border-borderMedium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {ent.type === 'person' ? (
                    <User className="w-4 h-4 text-accent" />
                  ) : (
                    <Tag className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs font-bold text-gray-100">{ent.name}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-canvas px-2 py-0.5 rounded">
                  {ent.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector (8 Cols) */}
      <div className="lg:col-span-8 bg-panel border border-borderSubtle rounded-xl p-6 flex flex-col gap-6 overflow-y-auto">
        {selectedEntity ? (
          <div className="flex flex-col gap-6">
            <div className="border-b border-borderSubtle pb-4">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider bg-accent/15 px-2 py-0.5 rounded">
                {selectedEntity.type}
              </span>
              <h2 className="text-2xl font-bold text-gray-100 mt-2">{selectedEntity.name}</h2>
              {selectedEntity.aliases && selectedEntity.aliases.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Aliases: <span className="text-gray-300">{selectedEntity.aliases.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-3 rounded-xl border border-borderSubtle">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Conversations
                </span>
                <p className="text-xl font-bold text-accent mt-1">{connectedConvs.length}</p>
              </div>
              <div className="bg-card p-3 rounded-xl border border-borderSubtle">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Relations
                </span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{connectedRels.length}</p>
              </div>
            </div>

            {/* Connected Conversations */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Participated Conversations ({connectedConvs.length})
              </h3>
              <div className="space-y-2">
                {connectedConvs.map((conv) => (
                  <div
                    key={conv.id}
                    className="bg-card p-4 rounded-xl border border-borderSubtle flex justify-between items-center"
                  >
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-bold text-gray-100">{conv.title}</h4>
                      <span className="text-[11px] font-mono text-gray-400">
                        Date: {conv.date || 'Undated'}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenConversation(conv.id)}
                      className="flex items-center gap-1.5 bg-accent/20 hover:bg-accent hover:text-black text-accent text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Open Recording</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs my-auto">Select an entity to inspect.</div>
        )}
      </div>
    </div>
  );
};
