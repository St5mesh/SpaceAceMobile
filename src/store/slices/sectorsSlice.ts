import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sector, UUID, SectorType } from '../../types';

interface SectorsState {
  sectors: Record<UUID, Sector>;
  currentSector?: UUID;
}

const initialState: SectorsState = {
  sectors: {},
  currentSector: undefined,
};

const sectorsSlice = createSlice({
  name: 'sectors',
  initialState,
  reducers: {
    createSector: (state, action: PayloadAction<Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      const id = Date.now().toString() + Math.random().toString(36);
      state.sectors[id] = {
        ...action.payload,
        id,
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateSector: (state, action: PayloadAction<{ id: UUID; updates: Partial<Sector> }>) => {
      const { id, updates } = action.payload;
      if (state.sectors[id]) {
        state.sectors[id] = {
          ...state.sectors[id],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    
    discoverSector: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      if (state.sectors[id] && !state.sectors[id].discoveredAt) {
        state.sectors[id].discoveredAt = new Date();
        state.sectors[id].updatedAt = new Date();
      }
    },
    
    moveTo: (state, action: PayloadAction<UUID>) => {
      state.currentSector = action.payload;
      // Auto-discover when moving to a sector
      if (state.sectors[action.payload] && !state.sectors[action.payload].discoveredAt) {
        state.sectors[action.payload].discoveredAt = new Date();
        state.sectors[action.payload].updatedAt = new Date();
      }
    },
    
    linkEncounter: (state, action: PayloadAction<{ sectorId: UUID; encounterId: UUID }>) => {
      const { sectorId, encounterId } = action.payload;
      if (state.sectors[sectorId]) {
        if (!state.sectors[sectorId].linkedEncounterIds.includes(encounterId)) {
          state.sectors[sectorId].linkedEncounterIds.push(encounterId);
          state.sectors[sectorId].updatedAt = new Date();
        }
      }
    },
    
    linkMission: (state, action: PayloadAction<{ sectorId: UUID; missionId: UUID }>) => {
      const { sectorId, missionId } = action.payload;
      if (state.sectors[sectorId]) {
        if (!state.sectors[sectorId].linkedMissionIds.includes(missionId)) {
          state.sectors[sectorId].linkedMissionIds.push(missionId);
          state.sectors[sectorId].updatedAt = new Date();
        }
      }
    },
    
    deleteSector: (state, action: PayloadAction<UUID>) => {
      delete state.sectors[action.payload];
      if (state.currentSector === action.payload) {
        state.currentSector = undefined;
      }
    },
    
    // Initialize some basic sectors for demo
    initializeGalaxy: (state) => {
      const now = new Date();
      // Create a small starting galaxy with home sector and a few neighbors
      const homeSector: Sector = {
        id: 'home-sector',
        hexQ: 0,
        hexR: 0,
        name: 'Home System',
        type: SectorType.CIVILIZED,
        discoveredAt: now,
        notes: 'Your starting location in civilized space.',
        linkedEncounterIds: [],
        linkedMissionIds: [],
        isDangerous: false,
        createdAt: now,
        updatedAt: now,
      };
      
      const sectors = [
        homeSector,
        {
          ...homeSector,
          id: 'frontier-1',
          hexQ: 1,
          hexR: 0,
          name: 'Frontier Outpost',
          type: SectorType.FRONTIER,
          discoveredAt: undefined,
          notes: 'A frontier sector waiting to be explored.',
          isDangerous: false,
        },
        {
          ...homeSector,
          id: 'dangerous-1',
          hexQ: 0,
          hexR: 1,
          name: 'Pirate Haven',
          type: SectorType.DANGEROUS,
          discoveredAt: undefined,
          notes: 'Reports suggest dangerous activity in this sector.',
          isDangerous: true,
        },
        {
          ...homeSector,
          id: 'unknown-1',
          hexQ: -1,
          hexR: 0,
          name: 'Unknown Space',
          type: SectorType.UNKNOWN,
          discoveredAt: undefined,
          notes: '',
          isDangerous: false,
        },
      ];
      
      sectors.forEach(sector => {
        state.sectors[sector.id] = sector;
      });
      
      state.currentSector = 'home-sector';
    },
  },
});

export const {
  createSector,
  updateSector,
  discoverSector,
  moveTo,
  linkEncounter,
  linkMission,
  deleteSector,
  initializeGalaxy,
} = sectorsSlice.actions;

export default sectorsSlice.reducer;