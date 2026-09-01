import React, { useState, useEffect } from 'react';
import { Mic, Play, Pause, CheckCircle, UserCheck, Filter, Sparkles } from 'lucide-react';
import { Catalog, SpeakerProfile, SpeakerIncident } from '../types';
import { useAudio, parseTimecode } from '../context/AudioContext';

interface SpeakerStudioProps {
  catalog: Catalog;
  onCatalogUpdate: (catalog: Catalog) => void;
  onJumpToConversation: (convId: string) => void;
}

export const SpeakerStudio: React.FC<SpeakerStudioProps> = ({
  catalog,
  onCatalogUpdate,
  onJumpToConversation,
}) => {
  const { playAt, isPlaying, currentTrack, togglePlay } = useAudio();
  const [incidents, setIncidents] = useState<SpeakerIncident[]>([]);
  const [roster, setRoster] = useState<SpeakerProfile[]>([]);
  const [filterSpeaker, setFilterSpeaker] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canonizingId, setCanonizingId] = useState<string | null>(null);

  // Fetch pre-aggregated incidents and roster from API
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/speaker-incidents').then((r) => r.json()),
      fetch('/api/speakers').then((r) => r.json()),
    ])
      .then(([incData, spkData]) => {
        setIncidents(incData.incidents || []);
        setRoster(spkData.speakers || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [catalog]);

  const handleCanonize = async (
    inc: SpeakerIncident,
    targetSpeakerId: string,
    targetSpeakerName: string
  ) => {
    const actionKey = `${inc.convId}-${inc.diarizationSpeaker}`;
    setCanonizingId(actionKey);

    try {
      const res = await fetch('/api/canonize-speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: inc.convId,
          transcriptPath: inc.transcriptPath,
          previousSpeaker: inc.diarizationSpeaker,
          speakerId: targetSpeakerId,
          speakerName: targetSpeakerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.catalog) onCatalogUpdate(data.catalog);
        setIncidents((prev) =>
          prev.filter(
            (item) => !(item.convId === inc.convId && item.diarizationSpeaker === inc.diarizationSpeaker)
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCanonizingId(null);
    }
  };

  // Filtered list
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSpeaker && inc.matchedSpeakerId !== filterSpeaker) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.convTitle.toLowerCase().includes(q) ||
      (inc.matchedSpeakerName || '').toLowerCase().includes(q) ||
      inc.diarizationSpeaker.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden h-[calc(100vh-140px)]">
      {/* Top Filter Bar */}
      <div className="bg-panel border border-borderSubtle p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Speaker Review &amp; Canonization Queue
            </h3>
            <p className="text-xs text-gray-400">
              Listen to turn samples, verify AI cosine similarity scores, and canonize speakers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-borderSubtle rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent"
          />

          <select
            value={filterSpeaker}
            onChange={(e) => setFilterSpeaker(e.target.value)}
            className="bg-card border border-borderSubtle rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none"
          >
            <option value="">All Predicted Speakers</option>
            {roster.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-gray-400 bg-card px-3 py-1.5 rounded-lg border border-borderSubtle">
            <strong className="text-accent">{filteredIncidents.length}</strong> in queue
          </span>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-xs font-mono">
            Scanning 57 audio sidecars for review incidents…
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-16 bg-panel border border-borderSubtle rounded-2xl text-center flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-accent" />
            <h3 className="text-lg font-bold text-gray-100">Corpus is Fully Attributed!</h3>
            <p className="text-xs text-gray-400 max-w-md">
              All speaker clusters across all 57 conversations have been verified and canonized.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIncidents.map((inc) => {
              const actionKey = `${inc.convId}-${inc.diarizationSpeaker}`;
              const isCanonizing = canonizingId === actionKey;
              const sec = parseTimecode(inc.firstTimecode) || 0;
              const confPct = Math.round((inc.confidence || 0) * 100);

              return (
                <div
                  key={actionKey}
                  className="bg-panel border border-borderSubtle hover:border-borderMedium p-5 rounded-2xl flex flex-col gap-4 transition shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <button
                        onClick={() => onJumpToConversation(inc.convId)}
                        className="text-left text-xs font-bold text-gray-100 hover:text-accent transition line-clamp-1"
                      >
                        {inc.convTitle}
                      </button>
                      <span className="text-[11px] text-gray-400 font-mono">
                        [{inc.diarizationSpeaker}] · {inc.count} turns
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-accent bg-accent/15 border border-accent/30 px-2 py-0.5 rounded">
                      ⏱ {inc.firstTimecode}
                    </span>
                  </div>

                  {/* Audio Sample Play */}
                  <div className="bg-card p-2.5 rounded-xl border border-borderSubtle flex items-center justify-between">
                    {(() => {
                      const isThisSamplePlaying = isPlaying && currentTrack?.audioPath === inc.audioPath;
                      return (
                        <button
                          onClick={() => {
                            if (isThisSamplePlaying) {
                              togglePlay();
                            } else {
                              playAt(sec, inc.audioPath, inc.convTitle);
                            }
                          }}
                          className={`flex items-center gap-2 font-bold text-[11px] px-3 py-1.5 rounded-lg transition transform hover:scale-105 ${
                            isThisSamplePlaying
                              ? 'bg-accent text-black shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                              : 'bg-accent hover:bg-accent-light text-black'
                          }`}
                        >
                          {isThisSamplePlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pause Audio</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Listen Turn Audio</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                    <span className="text-[10px] font-mono text-gray-400">
                      Sample turn at {inc.firstTimecode}
                    </span>
                  </div>

                  {/* Prediction Score Bar */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      AI Predicted Match
                    </span>
                    <div className="bg-card p-2.5 rounded-xl border border-borderSubtle flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-100">
                        {inc.matchedSpeakerName || 'Unknown Voice'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-canvas rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              confPct > 70 ? 'bg-emerald-500' : 'bg-accent'
                            }`}
                            style={{ width: `${confPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-gray-300">{confPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-2 border-t border-borderSubtle">
                    <button
                      disabled={isCanonizing}
                      onClick={() =>
                        handleCanonize(
                          inc,
                          inc.matchedSpeakerId || 'unknown',
                          inc.matchedSpeakerName || 'Speaker'
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2 px-3 rounded-lg transition transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        {isCanonizing
                          ? 'Canonizing…'
                          : `Canonize ${inc.matchedSpeakerName?.split(' ')[0] || 'Speaker'}`}
                      </span>
                    </button>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const chosen = roster.find((r) => r.id === e.target.value);
                          if (chosen) handleCanonize(inc, chosen.id, chosen.name);
                        }
                      }}
                      className="bg-card border border-borderSubtle text-xs text-gray-300 rounded-lg px-2.5 py-2 outline-none cursor-pointer max-w-[120px]"
                    >
                      <option value="">Assign Other…</option>
                      {roster.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
