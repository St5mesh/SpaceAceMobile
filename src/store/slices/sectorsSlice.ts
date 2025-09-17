import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sector, UUID, SectorType } from '../../types';
import { HexUtils } from '../../utils/hexUtils';
import { getSectorAsset, getAllSectorNames, getRandomSector } from '../../data/sectorAssets';

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

    discoverAdjacentSectors: (state, action: PayloadAction<UUID>) => {
      const currentSectorId = action.payload;
      const currentSector = state.sectors[currentSectorId];
      
      if (!currentSector) return;

      // Find all adjacent sectors using hex coordinate neighbors
      const neighbors = HexUtils.hexNeighbors({ 
        q: currentSector.hexQ, 
        r: currentSector.hexR 
      });

      // Auto-discover adjacent sectors when moving to a new sector
      Object.values(state.sectors).forEach(sector => {
        const isAdjacent = neighbors.some(neighbor => 
          neighbor.q === sector.hexQ && neighbor.r === sector.hexR
        );
        
        if (isAdjacent && !sector.discoveredAt) {
          // Only discover adjacent sectors, don't fully explore them
          // This creates the "known but not visited" state
          sector.discoveredAt = new Date();
          sector.updatedAt = new Date();
        }
      });
    },

    exploreSector: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      const sector = state.sectors[id];
      
      if (sector) {
        // Mark as discovered if not already
        if (!sector.discoveredAt) {
          sector.discoveredAt = new Date();
        }
        
        // Set the sector as fully explored (can be used for additional data)
        sector.updatedAt = new Date();
      }
    },
    
    moveTo: (state, action: PayloadAction<UUID>) => {
      const targetSectorId = action.payload;
      const previousSectorId = state.currentSector;
      
      state.currentSector = targetSectorId;
      
      // Auto-discover the target sector when moving to it
      const targetSector = state.sectors[targetSectorId];
      if (targetSector && !targetSector.discoveredAt) {
        targetSector.discoveredAt = new Date();
        targetSector.updatedAt = new Date();
      }

      // Discover adjacent sectors from the new position
      if (targetSector) {
        const neighbors = HexUtils.hexNeighbors({ 
          q: targetSector.hexQ, 
          r: targetSector.hexR 
        });

        Object.values(state.sectors).forEach(sector => {
          const isAdjacent = neighbors.some(neighbor => 
            neighbor.q === sector.hexQ && neighbor.r === sector.hexR
          );
          
          if (isAdjacent && !sector.discoveredAt) {
            sector.discoveredAt = new Date();
            sector.updatedAt = new Date();
          }
        });
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
    
    // Initialize a proper galaxy using the hex card assets
    initializeGalaxy: (state) => {
      const now = new Date();
      
      // Start with Lanai as the home system (Starbase 42)
      const lanaiAsset = getSectorAsset('lanai');
      const homeSector: Sector = {
        id: 'lanai',
        hexQ: 0,
        hexR: 0,
        name: 'Lanai',
        type: lanaiAsset?.type || SectorType.CIVILIZED,
        discoveredAt: now,
        notes: lanaiAsset?.description || 'Home of Starbase 42. Your starting location.',
        linkedEncounterIds: [],
        linkedMissionIds: [],
        isDangerous: false,
        createdAt: now,
        updatedAt: now,
      };
      
      // Create a galaxy layout using hex coordinates
      const galaxySectors: Sector[] = [homeSector];
      const usedCoordinates = new Set(['0,0']);
      const sectorNames = getAllSectorNames().filter(name => name !== 'lanai');
      
      // Generate sectors in expanding rings around Lanai
      for (let ring = 1; ring <= 4; ring++) {
        const ringHexes = HexUtils.hexRing({ q: 0, r: 0 }, ring);
        
        // Don't fill every position - create some empty space
        const sectorsInThisRing = Math.min(ringHexes.length, Math.floor(sectorNames.length / ring));
        const selectedHexes = ringHexes.slice(0, sectorsInThisRing);
        
        selectedHexes.forEach((hex, index) => {
          const coordKey = `${hex.q},${hex.r}`;
          if (usedCoordinates.has(coordKey)) return;
          
          // Get a random unused sector name
          const availableNames = sectorNames.filter(name => 
            !galaxySectors.some(s => s.name.toLowerCase() === name)
          );
          
          if (availableNames.length === 0) return;
          
          const sectorName = availableNames[Math.floor(Math.random() * availableNames.length)];
          const sectorAsset = getSectorAsset(sectorName);
          
          if (!sectorAsset) return;
          
          const isInitiallyDiscovered = ring === 1 || Math.random() < 0.3; // Nearby sectors more likely to be discovered
          
          const sector: Sector = {
            id: sectorName.toLowerCase(),
            hexQ: hex.q,
            hexR: hex.r,
            name: sectorAsset.name,
            type: sectorAsset.type,
            discoveredAt: isInitiallyDiscovered ? now : undefined,
            notes: sectorAsset.description,
            linkedEncounterIds: [],
            linkedMissionIds: [],
            isDangerous: sectorAsset.isDangerous,
            createdAt: now,
            updatedAt: now,
          };
          
          galaxySectors.push(sector);
          usedCoordinates.add(coordKey);
        });
      }
      
      // Clear existing sectors and add new ones
      state.sectors = {};
      galaxySectors.forEach(sector => {
        state.sectors[sector.id] = sector;
      });
      
      state.currentSector = 'lanai';
    },
  },
});

export const {
  createSector,
  updateSector,
  discoverSector,
  discoverAdjacentSectors,
  exploreSector,
  moveTo,
  linkEncounter,
  linkMission,
  deleteSector,
  initializeGalaxy,
} = sectorsSlice.actions;

export default sectorsSlice.reducer;