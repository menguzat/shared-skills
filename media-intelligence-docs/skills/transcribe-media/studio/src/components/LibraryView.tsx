import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, Volume2, Link as LinkIcon, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Catalog, Conversation, TranscriptTurn } from '../types';
import { useAudio, parseTimecode, formatTimecode } from '../context/AudioContext';

interface LibraryViewProps {
  catalog: Catalog;
  onSelectConversation?: (conv: Conversation) => void;
  selectedConvId?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  catalog,
  selectedConvId,
}) => {
  const { playAt, currentTime, currentTrack, isPlaying, togglePlay } = useAudio();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [transcriptTurns, setTranscriptTurns] = useState<TranscriptTurn[]>([]);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  // Entities Map
  const entityMap = new Map((catalog.entities || []).map((e) => [e.id, e]));

  // Dates, People, Projects filters
  const dates = [...new Set((catalog.conversations || []).map((c) => c.date).filter(Boolean))].sort();
  const people = (catalog.entities || []).filter((e) => e.type === 'person');
  const projects = (catalog.entities || []).filter((e) => e.type === 'project');

  // Filter conversations
  const filteredConversations = (catalog.conversations || []).filter((conv) => {
    if (selectedDate && conv.date !== selectedDate) return false;
    if (selectedPerson && !(conv.personIds || []).includes(selectedPerson)) return false;
    if (selectedProject && !(conv.projectIds || []).includes(selectedProject)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const entityText = [...(conv.projectIds || []), ...(conv.personIds || [])]
      .map((id) => entityMap.get(id)?.name || '')
      .join(' ')
      .toLowerCase();
    return (
      (conv.title || '').toLowerCase().includes(q) ||
      (conv.date || '').toLowerCase().includes(q) ||
      (conv.searchText || '').toLowerCase().includes(q) ||
      entityText.includes(q)
    );
  });

  // Select initial conversation or sync
  useEffect(() => {
    if (selectedConvId) {
      const found = catalog.conversations.find((c) => c.id === selectedConvId);
      if (found) {
        setSelectedConv(found);
        return;
      }
    }
    if (!selectedConv && filteredConversations.length > 0) {
      setSelectedConv(filteredConversations[0]);
    }
  }, [selectedConvId, catalog, filteredConversations]);

  // Load Transcript JSON when selectedConv changes
  useEffect(() => {
    if (!selectedConv?.transcriptPath) {
      setTranscriptTurns([]);
      return;
    }

    const jsonPath = selectedConv.transcriptPath.replace('.transcript.md', '.transcript.json');
    const cleanPath = jsonPath.replace(/^\.?\/?(?:\.conversations\/)?/, '');
    const url = `/.conversations/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;

    setIsLoadingTranscript(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Transcript not found');
        return res.json();
      })
      .then((data) => {
        setTranscriptTurns(data.transcription || []);
        setIsLoadingTranscript(false);
      })
      .catch(() => {
        setTranscriptTurns([]);
        setIsLoadingTranscript(false);
      });
  }, [selectedConv]);

  const convRelations = (catalog.relations || []).filter((r) => r.sourceId === selectedConv?.id);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
      {/* Sidebar Filter & List (5 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden h-[calc(100vh-140px)]">
        {/* Search & Filters */}
        <div className="bg-panel p-4 rounded-xl border border-borderSubtle flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, speaker, quote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-borderSubtle rounded-lg pl-9 pr-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-card border border-borderSubtle rounded px-2 py-1.5 text-[11px] text-gray-300 outline-none"
            >
              <option value="">All Dates</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="bg-card border border-borderSubtle rounded px-2 py-1.5 text-[11px] text-gray-300 outline-none"
            >
              <option value="">All People</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-card border border-borderSubtle rounded px-2 py-1.5 text-[11px] text-gray-300 outline-none"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
            <span>
              Showing <strong className="text-gray-200">{filteredConversations.length}</strong> records
            </span>
            {(search || selectedDate || selectedPerson || selectedProject) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDate('');
                  setSelectedPerson('');
                  setSelectedProject('');
                }}
                className="text-accent hover:underline text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Conversation Cards Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredConversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cardActive border-accent shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-card border-borderSubtle hover:bg-cardHover hover:border-borderMedium'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-semibold text-gray-100 line-clamp-1">{conv.title}</h4>
                  <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap bg-canvas px-1.5 py-0.5 rounded">
                    {conv.date || 'Undated'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {(conv.personIds || []).slice(0, 3).map((pid) => (
                    <span
                      key={pid}
                      className="text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-medium"
                    >
                      {entityMap.get(pid)?.name || pid}
                    </span>
                  ))}
                  {(conv.projectIds || []).slice(0, 2).map((pjid) => (
                    <span
                      key={pjid}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300"
                    >
                      {entityMap.get(pjid)?.name || pjid}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reader & Synchronized Audio Room (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden h-[calc(100vh-140px)]">
        {selectedConv ? (
          <div className="bg-panel border border-borderSubtle rounded-xl p-6 flex flex-col gap-5 overflow-hidden flex-1">
            {/* Header */}
            <div className="border-b border-borderSubtle pb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <span>{selectedConv.date || 'Undated Session'}</span>
                <span>·</span>
                <span className="text-gray-400">ID: {selectedConv.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">{selectedConv.title}</h2>

              <div className="flex flex-wrap gap-2 pt-1">
                {(selectedConv.personIds || []).map((pid) => (
                  <span
                    key={pid}
                    className="text-xs px-2.5 py-1 rounded-md bg-accent/15 border border-accent/30 text-accent font-semibold"
                  >
                    👤 {entityMap.get(pid)?.name || pid}
                  </span>
                ))}
                {(selectedConv.projectIds || []).map((pjid) => (
                  <span
                    key={pjid}
                    className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300"
                  >
                    🏷️ {entityMap.get(pjid)?.name || pjid}
                  </span>
                ))}
              </div>
            </div>

            {/* Audio Stream Action Card */}
            {selectedConv.audioPath && (
              <div className="bg-card p-4 rounded-xl border border-borderSubtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-100">
                      {selectedConv.audioPath.split('/').at(-1)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      High-fidelity acoustic stream
                    </span>
                  </div>
                </div>

                {(() => {
                  const isThisConvPlaying = isPlaying && currentTrack?.audioPath === selectedConv.audioPath;
                  return (
                    <button
                      onClick={() => {
                        if (isThisConvPlaying) {
                          togglePlay();
                        } else {
                          playAt(0, selectedConv.audioPath, selectedConv.title);
                        }
                      }}
                      className={`flex items-center gap-2 font-bold text-xs px-4 py-2.5 rounded-lg transition transform hover:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.25)] ${
                        isThisConvPlaying
                          ? 'bg-accent text-black shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                          : 'bg-accent hover:bg-accent-light text-black'
                      }`}
                    >
                      {isThisConvPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Listen &amp; Sync Transcript</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Relations & Evidence Excerpts */}
            {convRelations.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Verified Relations &amp; Evidence ({convRelations.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {convRelations.map((rel) => {
                    const targetName = entityMap.get(rel.targetId)?.name || rel.targetId;
                    return (
                      <div
                        key={rel.id}
                        className="bg-card p-3 rounded-lg border border-borderSubtle flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-accent">
                            {rel.type} → {targetName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {Math.round((rel.confidence || 0) * 100)}% conf
                          </span>
                        </div>
                        {(rel.evidence || []).map((ev, idx) => {
                          const timecode = typeof ev === 'object' ? ev.timecode : undefined;
                          const text = typeof ev === 'object' ? ev.quote || ev.excerpt : ev;
                          const sec = parseTimecode(timecode);
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (sec !== null && selectedConv.audioPath) {
                                  playAt(sec, selectedConv.audioPath, selectedConv.title);
                                }
                              }}
                              className="text-left text-[11px] text-gray-300 bg-canvas/60 p-2 rounded hover:border-accent hover:text-white border border-transparent transition flex items-start gap-1.5"
                            >
                              <LinkIcon className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                              <span className="line-clamp-2">
                                {timecode && <strong className="text-accent mr-1">[{timecode}]</strong>}
                                {text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Synchronized Transcript Turns */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span>Synchronized Transcript Turns ({transcriptTurns.length})</span>
                </h4>
                {currentTrack?.audioPath === selectedConv.audioPath && (
                  <span className="text-[11px] font-mono text-accent animate-pulse">
                    ● Tracking audio live
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {isLoadingTranscript ? (
                  <div className="p-8 text-center text-gray-500 text-xs font-mono">
                    Loading synchronized transcript turns…
                  </div>
                ) : transcriptTurns.length > 0 ? (
                  transcriptTurns.map((turn, idx) => {
                    const startSec = parseTimecode(turn.timecode) || 0;
                    const nextSec = transcriptTurns[idx + 1]
                      ? parseTimecode(transcriptTurns[idx + 1].timecode)
                      : startSec + 15;
                    const isTurnActive =
                      currentTrack?.audioPath === selectedConv.audioPath &&
                      currentTime >= startSec &&
                      currentTime < (nextSec || startSec + 15);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (selectedConv.audioPath) {
                            playAt(startSec, selectedConv.audioPath, selectedConv.title);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isTurnActive
                            ? 'bg-accent/15 border-accent shadow-[0_0_16px_rgba(245,158,11,0.2)] translate-x-1'
                            : 'bg-card border-borderSubtle hover:bg-cardHover hover:border-borderMedium'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                            🗣️ {turn.speaker || 'Speaker'}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 bg-canvas px-2 py-0.5 rounded border border-borderSubtle">
                            ⏱ {turn.timecode}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-gray-200">
                          {turn.text || turn.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    No transcript segments available for this session.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-panel border border-borderSubtle rounded-xl flex items-center justify-center text-gray-500 text-xs">
            Select a conversation to begin reading and listening.
          </div>
        )}
      </div>
    </div>
  );
};
