import { DieType, RollMode } from '../types';

/**
 * Secure random number utilities for fair dice rolling
 * Uses crypto-secure random when available, falls back to Math.random
 */
export class DiceUtils {
  private static rng: () => number;

  static {
    // Initialize with the best available RNG
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Use crypto.getRandomValues for secure random numbers
      this.rng = () => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / 0x100000000; // Convert to 0-1 range
      };
    } else {
      // Fallback to Math.random (should be avoided in production)
      console.warn('Crypto API not available, falling back to Math.random');
      this.rng = Math.random;
    }
  }

  /**
   * Get a random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  /**
   * Roll a single die of the specified type
   */
  static rollDie(dieType: DieType): number {
    const sides = dieType === DieType.D20 ? 20 : 6;
    return this.randomInt(1, sides);
  }

  /**
   * Roll dice with the specified mode (normal, advantage, disadvantage)
   */
  static rollDiceWithMode(dieType: DieType, mode: RollMode): {
    result: number;
    rolls: number[];
  } {
    if (mode === RollMode.NORMAL) {
      const roll = this.rollDie(dieType);
      return { result: roll, rolls: [roll] };
    }

    // For advantage/disadvantage, roll twice
    const roll1 = this.rollDie(dieType);
    const roll2 = this.rollDie(dieType);
    const rolls = [roll1, roll2];

    const result = mode === RollMode.ADVANTAGE 
      ? Math.max(roll1, roll2)
      : Math.min(roll1, roll2);

    return { result, rolls };
  }

  /**
   * Apply modifiers to a dice result
   */
  static applyModifiers(baseResult: number, modifiers: number[]): number {
    return modifiers.reduce((total, modifier) => total + modifier, baseResult);
  }

  /**
   * Perform a complete dice roll with all features
   */
  static performRoll(
    dieType: DieType,
    mode: RollMode = RollMode.NORMAL,
    modifiers: number[] = []
  ): {
    baseResult: number;
    allRolls: number[];
    modifiers: number[];
    finalResult: number;
    mode: RollMode;
    dieType: DieType;
  } {
    const { result: baseResult, rolls: allRolls } = this.rollDiceWithMode(dieType, mode);
    const finalResult = this.applyModifiers(baseResult, modifiers);

    return {
      baseResult,
      allRolls,
      modifiers,
      finalResult,
      mode,
      dieType,
    };
  }

  /**
   * Get statistical information about a die type
   */
  static getDieStats(dieType: DieType): {
    sides: number;
    min: number;
    max: number;
    average: number;
  } {
    const sides = dieType === DieType.D20 ? 20 : 6;
    return {
      sides,
      min: 1,
      max: sides,
      average: (sides + 1) / 2,
    };
  }

  /**
   * Calculate probability of rolling at or above a target number
   */
  static calculateSuccessProbability(
    target: number,
    dieType: DieType,
    mode: RollMode = RollMode.NORMAL,
    modifiers: number[] | number = []
  ): number {
    const sides = dieType === DieType.D20 ? 20 : 6;
    const modifier = Array.isArray(modifiers) 
      ? modifiers.reduce((sum, mod) => sum + mod, 0) 
      : modifiers;
    
    const adjustedTarget = target - modifier;
    
    if (adjustedTarget <= 1) return 1; // Always succeeds
    if (adjustedTarget > sides) return 0; // Never succeeds

    if (mode === RollMode.NORMAL) {
      return (sides - adjustedTarget + 1) / sides;
    }

    // For advantage/disadvantage, calculate based on two rolls
    const singleSuccess = (sides - adjustedTarget + 1) / sides;
    const singleFailure = 1 - singleSuccess;

    if (mode === RollMode.ADVANTAGE) {
      // Succeeds if either roll succeeds
      return 1 - (singleFailure * singleFailure);
    } else {
      // Succeeds only if both rolls would succeed
      return singleSuccess * singleSuccess;
    }
  }

  /**
   * Generate a summary of a roll result
   */
  static formatRollResult(
    result: ReturnType<typeof DiceUtils.performRoll>,
    includeDetails: boolean = false
  ): string {
    let summary = `${result.dieType}: ${result.baseResult}`;

    if (result.mode !== RollMode.NORMAL) {
      summary += ` (${result.mode})`;
      if (includeDetails && result.allRolls.length > 1) {
        summary += ` [rolled: ${result.allRolls.join(', ')}]`;
      }
    }

    if (result.modifiers.length > 0) {
      const modifierSum = result.modifiers.reduce((sum, mod) => sum + mod, 0);
      const sign = modifierSum >= 0 ? '+' : '';
      summary += ` ${sign}${modifierSum} = ${result.finalResult}`;
    }

    return summary;
  }

  /**
   * Validate dice roll parameters
   */
  static validateRollParams(
    dieType: DieType,
    mode: RollMode,
    modifiers: number[]
  ): { valid: boolean; error?: string } {
    if (!Object.values(DieType).includes(dieType)) {
      return { valid: false, error: 'Invalid die type' };
    }

    if (!Object.values(RollMode).includes(mode)) {
      return { valid: false, error: 'Invalid roll mode' };
    }

    if (!Array.isArray(modifiers)) {
      return { valid: false, error: 'Modifiers must be an array' };
    }

    if (modifiers.some(mod => !Number.isInteger(mod))) {
      return { valid: false, error: 'All modifiers must be integers' };
    }

    return { valid: true };
  }

  /**
   * Get the source of randomness for transparency
   */
  static getRandomnessSource(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      return 'Cryptographically secure random (crypto.getRandomValues)';
    } else {
      return 'Pseudorandom (Math.random) - not cryptographically secure';
    }
  }

  /**
   * Test the randomness quality (for debugging)
   */
  static testRandomness(samples: number = 1000): {
    average: number;
    distribution: number[];
    chiSquare?: number;
  } {
    const results: number[] = [];
    const distribution = new Array(20).fill(0); // Track D20 distribution
    
    for (let i = 0; i < samples; i++) {
      const roll = this.rollDie(DieType.D20);
      results.push(roll);
      distribution[roll - 1]++;
    }

    const average = results.reduce((sum, roll) => sum + roll, 0) / results.length;
    
    // Calculate chi-square test statistic
    const expected = samples / 20;
    const chiSquare = distribution.reduce((sum, observed) => {
      const diff = observed - expected;
      return sum + (diff * diff) / expected;
    }, 0);

    return {
      average,
      distribution,
      chiSquare,
    };
  }
}