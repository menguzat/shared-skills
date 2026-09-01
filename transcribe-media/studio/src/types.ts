export interface Quality {
  transcriptStatus?: string;
  reviewState?: string;
  status?: string;
  speakerAttribution?: string;
}

export interface Conversation {
  id: string;
  date?: string;
  title: string;
  audioPath?: string;
  audioPaths?: string[];
  transcriptPath?: string;
  analysisPaths?: string[];
  knowledgePaths?: string[];
  speakerAttributionPaths?: string[];
  sourcePaths?: string[];
  projectIds?: string[];
  personIds?: string[];
  searchText?: string;
  quality?: Quality;
}

export interface Entity {
  id: string;
  type: 'person' | 'project' | 'organization' | 'topic' | string;
  name: string;
  aliases?: string[];
  status?: string;
}

export interface Evidence {
  timecode?: string;
  quote?: string;
  excerpt?: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  validFrom?: string | null;
  validTo?: string | null;
  status?: string;
  confidence?: number;
  evidence?: (string | Evidence)[];
}

export interface ReviewQueueItem {
  conversationId: string;
  state?: string;
  status?: string;
}

export interface Catalog {
  schemaVersion: string | number;
  generatedAt: string;
  conversations: Conversation[];
  entities: Entity[];
  relations: Relation[];
  reviewQueue?: ReviewQueueItem[];
}

export interface SpeakerProfile {
  id: string;
  name: string;
  role?: string;
  gender?: string;
  createdAt?: string;
}

export interface SpeakerIncident {
  convId: string;
  convTitle: string;
  audioPath: string;
  transcriptPath: string;
  diarizationSpeaker: string;
  count: number;
  firstTimecode: string;
  matchedSpeakerId?: string;
  matchedSpeakerName?: string;
  confidence: number;
  margin?: number;
  status: string;
}

export interface TranscriptTurn {
  speaker?: string;
  timecode: string;
  endTimecode?: string;
  text?: string;
  content?: string;
}

export interface TranscriptJson {
  transcription?: TranscriptTurn[];
  metadata?: any;
}
