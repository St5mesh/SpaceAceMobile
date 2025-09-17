import { HexCoordinate, Point } from '../types';

/**
 * Hex grid utilities using axial coordinates (q, r)
 * Based on the cube coordinate system where q + r + s = 0
 */

export class HexUtils {
  /**
   * Convert hex coordinates to pixel coordinates
   * @param hex Hex coordinate
   * @param size Size of hex (radius from center to vertex)
   * @returns Pixel coordinates
   */
  static hexToPixel(hex: HexCoordinate, size: number): Point {
    const x = size * (3/2 * hex.q);
    const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
    return { x, y };
  }

  /**
   * Convert pixel coordinates to hex coordinates
   * @param point Pixel coordinates
   * @param size Size of hex
   * @returns Hex coordinate
   */
  static pixelToHex(point: Point, size: number): HexCoordinate {
    const q = (2/3 * point.x) / size;
    const r = (-1/3 * point.x + Math.sqrt(3)/3 * point.y) / size;
    return this.hexRound({ q, r });
  }

  /**
   * Round fractional hex coordinates to nearest hex
   * @param hex Fractional hex coordinates
   * @returns Rounded hex coordinates
   */
  static hexRound(hex: HexCoordinate): HexCoordinate {
    const s = -hex.q - hex.r;
    const roundedQ = Math.round(hex.q);
    const roundedR = Math.round(hex.r);
    const roundedS = Math.round(s);

    const qDiff = Math.abs(roundedQ - hex.q);
    const rDiff = Math.abs(roundedR - hex.r);
    const sDiff = Math.abs(roundedS - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      return { q: -roundedR - roundedS, r: roundedR };
    } else if (rDiff > sDiff) {
      return { q: roundedQ, r: -roundedQ - roundedS };
    } else {
      return { q: roundedQ, r: roundedR };
    }
  }

  /**
   * Calculate distance between two hex coordinates
   * @param a First hex coordinate
   * @param b Second hex coordinate
   * @returns Distance in hex units
   */
  static hexDistance(a: HexCoordinate, b: HexCoordinate): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }

  /**
   * Get all hex coordinates within a given range
   * @param center Center hex coordinate
   * @param range Range in hex units
   * @returns Array of hex coordinates within range
   */
  static hexesWithinRange(center: HexCoordinate, range: number): HexCoordinate[] {
    const results: HexCoordinate[] = [];
    
    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);
      
      for (let r = r1; r <= r2; r++) {
        results.push({ 
          q: center.q + q, 
          r: center.r + r 
        });
      }
    }
    
    return results;
  }

  /**
   * Get the six neighbors of a hex coordinate
   * @param hex Center hex coordinate
   * @returns Array of six neighboring hex coordinates
   */
  static hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
    const directions = [
      { q: 1, r: 0 },   // East
      { q: 1, r: -1 },  // Northeast  
      { q: 0, r: -1 },  // Northwest
      { q: -1, r: 0 },  // West
      { q: -1, r: 1 },  // Southwest
      { q: 0, r: 1 },   // Southeast
    ];

    return directions.map(dir => ({
      q: hex.q + dir.q,
      r: hex.r + dir.r
    }));
  }

  /**
   * Get a line of hex coordinates between two points
   * @param start Start hex coordinate
   * @param end End hex coordinate
   * @returns Array of hex coordinates forming a line
   */
  static hexLine(start: HexCoordinate, end: HexCoordinate): HexCoordinate[] {
    const distance = this.hexDistance(start, end);
    const results: HexCoordinate[] = [];
    
    for (let i = 0; i <= distance; i++) {
      const t = distance === 0 ? 0 : i / distance;
      const q = start.q * (1 - t) + end.q * t;
      const r = start.r * (1 - t) + end.r * t;
      results.push(this.hexRound({ q, r }));
    }
    
    return results;
  }

  /**
   * Generate a ring of hex coordinates at a specific distance
   * @param center Center hex coordinate
   * @param radius Distance from center
   * @returns Array of hex coordinates forming a ring
   */
  static hexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
    if (radius === 0) return [center];
    
    const results: HexCoordinate[] = [];
    let hex = { q: center.q + radius, r: center.r - radius };
    
    const directions = [
      { q: -1, r: 1 },  // Southwest
      { q: -1, r: 0 },  // West
      { q: 0, r: -1 },  // Northwest
      { q: 1, r: -1 },  // Northeast
      { q: 1, r: 0 },   // East
      { q: 0, r: 1 },   // Southeast
    ];

    for (const direction of directions) {
      for (let i = 0; i < radius; i++) {
        results.push({ ...hex });
        hex.q += direction.q;
        hex.r += direction.r;
      }
    }
    
    return results;
  }

  /**
   * Generate a spiral of hex coordinates starting from center
   * @param center Center hex coordinate
   * @param maxRadius Maximum radius for the spiral
   * @returns Array of hex coordinates in spiral order
   */
  static hexSpiral(center: HexCoordinate, maxRadius: number): HexCoordinate[] {
    const results: HexCoordinate[] = [center];
    
    for (let radius = 1; radius <= maxRadius; radius++) {
      results.push(...this.hexRing(center, radius));
    }
    
    return results;
  }

  /**
   * Convert hex coordinate to a string key
   * @param hex Hex coordinate
   * @returns String key for use in objects/maps
   */
  static hexToKey(hex: HexCoordinate): string {
    return `${hex.q},${hex.r}`;
  }

  /**
   * Convert string key back to hex coordinate
   * @param key String key
   * @returns Hex coordinate
   */
  static keyToHex(key: string): HexCoordinate {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
  }

  /**
   * Check if a sector should be discoverable from current position
   * Based on game rules: sectors are discoverable if adjacent to discovered sectors
   * @param targetHex Target sector coordinates
   * @param discoveredSectors Array of discovered sector coordinates
   * @returns True if the sector should be discoverable
   */
  static isDiscoverable(targetHex: HexCoordinate, discoveredSectors: HexCoordinate[]): boolean {
    // A sector is discoverable if it's adjacent to any discovered sector
    return discoveredSectors.some(discovered => {
      const distance = this.hexDistance(targetHex, discovered);
      return distance <= 1;
    });
  }

  /**
   * Get all sectors that should be visible from a given position
   * @param centerHex Current position
   * @param allSectors All sectors in the galaxy
   * @param visibilityRange How far the player can see (default: 1 hex)
   * @returns Array of sectors that should be visible
   */
  static getVisibleSectors(
    centerHex: HexCoordinate, 
    allSectors: HexCoordinate[], 
    visibilityRange: number = 1
  ): HexCoordinate[] {
    return allSectors.filter(sector => {
      const distance = this.hexDistance(centerHex, sector);
      return distance <= visibilityRange;
    });
  }

  /**
   * Check if two hex coordinates are equal
   * @param a First hex coordinate
   * @param b Second hex coordinate
   * @returns True if coordinates are equal
   */
  static hexEqual(a: HexCoordinate, b: HexCoordinate): boolean {
    return a.q === b.q && a.r === b.r;
  }
}