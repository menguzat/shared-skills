import React, { useState, useEffect } from 'react';
import { Catalog, Conversation } from './types';
import { Navigation, ViewTab } from './components/Navigation';
import { LibraryView } from './components/LibraryView';
import { SpeakerStudio } from './components/SpeakerStudio';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { EntitiesView } from './components/EntitiesView';
import { AudioDeck } from './components/AudioDeck';
import { AudioProvider } from './context/AudioContext';

export const App: React.FC = () => {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('library');
  const [incidentCount, setIncidentCount] = useState<number>(0);
  const [jumpConvId, setJumpConvId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = () => {
    fetch('/api/catalog')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setCatalog(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  const fetchIncidentCount = () => {
    fetch('/api/speaker-incidents')
      .then((r) => r.json())
      .then((data) => setIncidentCount(data.total || 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCatalog();
    fetchIncidentCount();
  }, []);

  const handleOpenConversation = (convId: string) => {
    setJumpConvId(convId);
    setActiveTab('library');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas text-gray-300 gap-3">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-wider">Loading Conversation Intelligence Studio…</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas text-gray-300 gap-4 p-8 text-center">
        <div className="bg-panel p-6 rounded-2xl border border-red-500/30 max-w-md">
          <h2 className="text-base font-bold text-red-400">Failed to Connect to Studio Backend</h2>
          <p className="text-xs text-gray-400 mt-2">
            {error || 'Could not fetch catalog.json from backend.'}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetchCatalog();
            }}
            className="mt-4 px-4 py-2 bg-accent text-black text-xs font-bold rounded-lg hover:bg-accent-light transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <AudioProvider>
      <div className="flex flex-col min-h-screen bg-canvas text-gray-100 pb-16 select-none">
        <Navigation
          catalog={catalog}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          incidentCount={incidentCount}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'library' && (
            <LibraryView catalog={catalog} selectedConvId={jumpConvId} />
          )}

          {activeTab === 'studio' && (
            <SpeakerStudio
              catalog={catalog}
              onCatalogUpdate={(updated) => {
                setCatalog(updated);
                fetchIncidentCount();
              }}
              onJumpToConversation={handleOpenConversation}
            />
          )}

          {activeTab === 'graph' && (
            <KnowledgeGraph catalog={catalog} onOpenConversation={handleOpenConversation} />
          )}

          {activeTab === 'entities' && (
            <EntitiesView catalog={catalog} onOpenConversation={handleOpenConversation} />
          )}
        </main>

        <AudioDeck />
      </div>
    </AudioProvider>
  );
};
