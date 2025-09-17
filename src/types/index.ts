// Data models for SpaceAce Mobile based on requirements

export type UUID = string;

// Enums
export enum DieType {
  D20 = 'd20',
  D6 = 'd6',
}

export enum RollMode {
  NORMAL = 'normal',
  ADVANTAGE = 'advantage',
  DISADVANTAGE = 'disadvantage',
}

export enum LogEntryType {
  NOTE = 'note',
  ROLL = 'roll',
  TRAVEL = 'travel',
  DAMAGE = 'damage',
  REWARD = 'reward',
  ENCOUNTER = 'encounter',
  MISSION_UPDATE = 'mission_update',
}

export enum ObjectiveStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

export enum SectorType {
  UNKNOWN = 'unknown',
  CIVILIZED = 'civilized',
  FRONTIER = 'frontier',
  DANGEROUS = 'dangerous',
  ANOMALY = 'anomaly',
}

// Core entity types
export interface Character {
  id: UUID;
  name: string;
  career: string;
  knacks: string;
  drive: string;
  gumption: {
    current: number;
    maximum: number;
  };
  catchphrase: string;
  // Legacy fields - keeping for backward compatibility
  species?: string;
  notes?: string;
  fame?: number;
  sway?: number;
  heat?: number;
  tags: string[];
  inventory: InventoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ship {
  id: UUID;
  name: string;
  purpose: string;
  personality: string;
  shields: number;
  maxShields: number;
  hull: number;
  maxHull: number;
  driveRange: number;
  modules: string[];
  quirks: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sector {
  id: UUID;
  hexQ: number; // axial coordinate q
  hexR: number; // axial coordinate r
  name: string;
  type: SectorType;
  discoveredAt?: Date;
  notes: string;
  linkedEncounterIds: UUID[];
  linkedMissionIds: UUID[];
  isDangerous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  id: UUID;
  title: string;
  description: string;
  objectives: Objective[];
  rewards: string;
  fameDelta: number;
  swayDelta: number;
  relatedSectorIds: UUID[];
  npcIds: UUID[];
  status: ObjectiveStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Objective {
  id: UUID;
  text: string;
  status: ObjectiveStatus;
}

export interface Encounter {
  id: UUID;
  title: string;
  type: string;
  sectorId?: UUID;
  missionId?: UUID;
  date: Date;
  outcome: string;
  heatContext: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NPC {
  id: UUID;
  name: string;
  species: string;
  role: string;
  disposition: string;
  relationship: string;
  sectorIds: UUID[];
  missionIds: UUID[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: UUID;
  dateRange: {
    start: Date;
    end?: Date;
  };
  summary: string;
  entryIds: UUID[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogEntry {
  id: UUID;
  timestamp: Date;
  type: LogEntryType;
  data: any; // JSON data specific to the log type
  entityIds: UUID[]; // references to related entities
  sessionId: UUID;
  note?: string;
}

export interface Roll {
  id: UUID;
  dieType: DieType;
  result: number;
  results?: number[]; // for advantage/disadvantage showing all rolls
  modifiers: number[];
  mode: RollMode;
  note?: string;
  timestamp: Date;
  sessionId?: UUID;
  missionId?: UUID;
  encounterId?: UUID;
}

export interface InventoryItem {
  id: UUID;
  name: string;
  description: string;
  tags: string[];
  quantity: number;
}

// UI/Navigation types
export type RootStackParamList = {
  Main: undefined;
  DiceRoller: undefined;
  SectorDetail: { sectorId: UUID };
  MissionDetail: { missionId: UUID };
  NPCDetail: { npcId: UUID };
  EncounterDetail: { encounterId: UUID };
};

export type TabParamList = {
  Home: undefined;
  Galaxy: undefined;
  Missions: undefined;
  Journal: undefined;
  Character: undefined;
  Ship: undefined;
  More: undefined;
};

// App state types
export interface AppState {
  character?: Character;
  ship?: Ship;
  sectors: Record<UUID, Sector>;
  missions: Record<UUID, Mission>;
  encounters: Record<UUID, Encounter>;
  npcs: Record<UUID, NPC>;
  sessions: Record<UUID, Session>;
  logEntries: Record<UUID, LogEntry>;
  rolls: Record<UUID, Roll>;
  currentSession?: UUID;
  currentSector?: UUID;
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  hapticFeedback: boolean;
  anonymousAnalytics: boolean;
  requireAuth: boolean;
  autoLogRolls: boolean;
}

// Hex coordinate utilities
export interface HexCoordinate {
  q: number;
  r: number;
  s?: number; // derived: q + r + s = 0
}

export interface Point {
  x: number;
  y: number;
}