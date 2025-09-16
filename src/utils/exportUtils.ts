import { RootState } from '../store';
import { 
  Character, 
  Ship, 
  Mission, 
  Session, 
  LogEntry, 
  Roll,
  Sector,
  Encounter,
  NPC 
} from '../types';

export interface ExportData {
  version: string;
  exportDate: string;
  character?: Character;
  ship?: Ship;
  sectors: Record<string, Sector>;
  missions: Record<string, Mission>;
  encounters: Record<string, Encounter>;
  npcs: Record<string, NPC>;
  sessions: Record<string, Session>;
  logEntries: Record<string, LogEntry>;
  rolls: Record<string, Roll>;
  settings: any;
}

export class DataExportUtils {
  /**
   * Export all app data to a structured format
   */
  static exportAllData(state: RootState): ExportData {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      character: state.character.current,
      ship: state.ship.current,
      sectors: state.sectors.sectors,
      missions: state.missions.missions,
      encounters: state.encounters.encounters,
      npcs: state.npcs.npcs,
      sessions: state.sessions.sessions,
      logEntries: state.logEntries.logEntries,
      rolls: state.rolls.rolls,
      settings: state.settings,
    };
  }

  /**
   * Export only campaign data (excluding settings)
   */
  static exportCampaignData(state: RootState): Partial<ExportData> {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      character: state.character.current,
      ship: state.ship.current,
      sectors: state.sectors.sectors,
      missions: state.missions.missions,
      encounters: state.encounters.encounters,
      npcs: state.npcs.npcs,
      sessions: state.sessions.sessions,
      logEntries: state.logEntries.logEntries,
    };
  }

  /**
   * Export session data for a specific session
   */
  static exportSessionData(state: RootState, sessionId: string): any {
    const session = state.sessions.sessions[sessionId];
    if (!session) return null;

    const sessionLogEntries = Object.values(state.logEntries.logEntries)
      .filter(entry => entry.sessionId === sessionId);
    
    const sessionRolls = Object.values(state.rolls.rolls)
      .filter(roll => roll.sessionId === sessionId);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      session,
      logEntries: sessionLogEntries,
      rolls: sessionRolls,
      character: state.character.current,
      ship: state.ship.current,
    };
  }

  /**
   * Generate a human-readable campaign summary
   */
  static generateCampaignSummary(state: RootState): string {
    const character = state.character.current;
    const ship = state.ship.current;
    const sessions = Object.values(state.sessions.sessions);
    const missions = Object.values(state.missions.missions);
    const sectors = Object.values(state.sectors.sectors);
    const rolls = Object.values(state.rolls.rolls);

    const completedMissions = missions.filter(m => m.status === 'complete');
    const discoveredSectors = sectors.filter(s => s.discoveredAt);

    let summary = '# Space Aces Campaign Summary\n\n';
    
    if (character) {
      summary += `## Character: ${character.name}\n`;
      summary += `- **Species:** ${character.species}\n`;
      summary += `- **Career:** ${character.career}\n`;
      summary += `- **Fame:** ${character.fame}\n`;
      summary += `- **Sway:** ${character.sway}\n`;
      summary += `- **Heat:** ${character.heat}\n`;
      if (character.notes) {
        summary += `- **Notes:** ${character.notes}\n`;
      }
      summary += '\n';
    }

    if (ship) {
      summary += `## Ship: ${ship.name}\n`;
      summary += `- **Purpose:** ${ship.purpose}\n`;
      summary += `- **Personality:** ${ship.personality}\n`;
      summary += `- **Shields:** ${ship.shields}/${ship.maxShields}\n`;
      summary += `- **Hull:** ${ship.hull}/${ship.maxHull}\n`;
      summary += `- **Drive Range:** ${ship.driveRange}\n`;
      if (ship.notes) {
        summary += `- **Notes:** ${ship.notes}\n`;
      }
      summary += '\n';
    }

    summary += '## Campaign Statistics\n';
    summary += `- **Sessions Played:** ${sessions.length}\n`;
    summary += `- **Total Missions:** ${missions.length}\n`;
    summary += `- **Completed Missions:** ${completedMissions.length}\n`;
    summary += `- **Sectors Discovered:** ${discoveredSectors.length}/${sectors.length}\n`;
    summary += `- **Dice Rolled:** ${rolls.length}\n`;
    summary += '\n';

    if (completedMissions.length > 0) {
      summary += '## Completed Missions\n';
      completedMissions.forEach(mission => {
        summary += `- **${mission.title}**`;
        if (mission.description) {
          summary += `: ${mission.description}`;
        }
        summary += '\n';
      });
      summary += '\n';
    }

    if (discoveredSectors.length > 0) {
      summary += '## Explored Sectors\n';
      discoveredSectors.forEach(sector => {
        summary += `- **${sector.name}** (${sector.hexQ}, ${sector.hexR}) - ${sector.type}`;
        if (sector.notes) {
          summary += `: ${sector.notes}`;
        }
        summary += '\n';
      });
      summary += '\n';
    }

    return summary;
  }

  /**
   * Generate a session report
   */
  static generateSessionReport(state: RootState, sessionId: string): string {
    const session = state.sessions.sessions[sessionId];
    if (!session) return '';

    const sessionLogEntries = Object.values(state.logEntries.logEntries)
      .filter(entry => entry.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let report = `# Session Report: ${session.summary}\n\n`;
    report += `**Date:** ${new Date(session.dateRange.start).toLocaleDateString()}\n`;
    
    if (session.dateRange.end) {
      const duration = new Date(session.dateRange.end).getTime() - new Date(session.dateRange.start).getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      report += `**Duration:** ${hours}h ${minutes}m\n`;
    }
    
    report += `**Log Entries:** ${sessionLogEntries.length}\n\n`;

    if (sessionLogEntries.length > 0) {
      report += '## Session Timeline\n\n';
      
      sessionLogEntries.forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const type = entry.type.replace('_', ' ').toUpperCase();
        
        report += `**${time}** - ${type}`;
        if (entry.note) {
          report += `: ${entry.note}`;
        }
        report += '\n';
      });
    }

    return report;
  }

  /**
   * Validate import data structure
   */
  static validateImportData(data: any): boolean {
    try {
      // Check for required fields
      if (!data.version || !data.exportDate) {
        return false;
      }

      // Check version compatibility
      const version = data.version.split('.').map(Number);
      if (version[0] > 1) {
        console.warn('Import data is from a newer version');
      }

      // Validate data structure
      if (data.character && typeof data.character !== 'object') return false;
      if (data.ship && typeof data.ship !== 'object') return false;
      if (data.sectors && typeof data.sectors !== 'object') return false;
      if (data.missions && typeof data.missions !== 'object') return false;

      return true;
    } catch (error) {
      console.error('Import validation error:', error);
      return false;
    }
  }

  /**
   * Get file size estimate for export data
   */
  static getExportSize(data: any): number {
    try {
      const json = JSON.stringify(data);
      return new Blob([json]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Create a filename for export
   */
  static createExportFilename(type: 'campaign' | 'session' | 'all' = 'campaign'): string {
    const date = new Date().toISOString().split('T')[0];
    return `spaceace-${type}-${date}.json`;
  }
}