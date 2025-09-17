import { SectorType } from '../types';

export interface SectorAsset {
  name: string;
  type: SectorType;
  isDangerous: boolean;
  description: string;
  imageName: string;
}

// Mapping of sector cards from the hex assets with their properties
// Based on the game rules and typical space opera tropes
export const SECTOR_ASSETS: Record<string, SectorAsset> = {
  'lanai': {
    name: 'Lanai',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'Home of Starbase 42. The starting point for Space Aces.',
    imageName: 'Lanai.png'
  },
  'solaris': {
    name: 'Solaris',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A bright star system with established trade routes.',
    imageName: 'Solaris.png'
  },
  'lumina': {
    name: 'Lumina',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A luminous system known for its research facilities.',
    imageName: 'Lumina.png'
  },
  'vega': {
    name: 'Vega',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'An established system with strong governmental presence.',
    imageName: 'Vega.png'
  },
  'gemma': {
    name: 'Gemma',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A mining system rich in precious gems and crystals.',
    imageName: 'Gemma.png'
  },
  'rukbat': {
    name: 'Rukbat',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A frontier system with agricultural colonies.',
    imageName: 'Rukbat.png'
  },
  'viridis': {
    name: 'Viridis',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A green world with terraforming operations.',
    imageName: 'Viridis.png'
  },
  'hope': {
    name: 'Hope',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A colony system representing hope for expansion.',
    imageName: 'Hope.png'
  },
  'corsair': {
    name: 'Corsair',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'Known pirate haven with frequent raids.',
    imageName: 'Corsair.png'
  },
  'tyranus': {
    name: 'Tyranus',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A system ruled by a tyrannical warlord.',
    imageName: 'Tyranus.png'
  },
  'malalo': {
    name: 'Malalo',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A system plagued by conflicts and unrest.',
    imageName: 'Malalo.png'
  },
  'maelstro': {
    name: 'Maelstro',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A chaotic system with dangerous space storms.',
    imageName: 'Maelstro.png'
  },
  'vanta': {
    name: 'Vanta',
    type: SectorType.ANOMALY,
    isDangerous: true,
    description: 'A dark system with mysterious properties.',
    imageName: 'Vanta.png'
  },
  'eidolon': {
    name: 'Eidolon',
    type: SectorType.ANOMALY,
    isDangerous: true,
    description: 'A ghostly system with spectral phenomena.',
    imageName: 'Eidolon.png'
  },
  'gazer': {
    name: 'Gazer',
    type: SectorType.ANOMALY,
    isDangerous: true,
    description: 'A system with strange observational effects.',
    imageName: 'Gazer.png'
  },
  'efflux': {
    name: 'Efflux',
    type: SectorType.ANOMALY,
    isDangerous: true,
    description: 'A system with dangerous energy emissions.',
    imageName: 'Efflux.png'
  },
  'xinti': {
    name: 'Xinti',
    type: SectorType.UNKNOWN,
    isDangerous: false,
    description: 'An unexplored system of alien origin.',
    imageName: 'Xinti.png'
  },
  'douglas': {
    name: 'Douglas',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A hardy frontier system with industrial focus.',
    imageName: 'Douglas.png'
  },
  'asimov': {
    name: 'Asimov',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A system renowned for its robotic industries.',
    imageName: 'Asimov.png'
  },
  'antilae': {
    name: 'Antilae',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A frontier system on the edge of known space.',
    imageName: 'Antilae.png'
  },
  'arrak': {
    name: 'Arrak',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A desert system with harsh conditions.',
    imageName: 'Arrak.png'
  },
  'bandor': {
    name: 'Bandor',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A system controlled by criminal organizations.',
    imageName: 'Bandor.png'
  },
  'beez': {
    name: 'Beez',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A system with industrious insectoid colonies.',
    imageName: 'Beez.png'
  },
  'bloom': {
    name: 'Bloom',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A flourishing agricultural system.',
    imageName: 'Bloom.png'
  },
  'fluffulon': {
    name: 'Fluffulon',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A peaceful system known for its comfort industries.',
    imageName: 'Fluffulon.png'
  },
  'frigus': {
    name: 'Frigus',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A cold system with ice mining operations.',
    imageName: 'Frigus.png'
  },
  'glorp': {
    name: 'Glorp',
    type: SectorType.UNKNOWN,
    isDangerous: false,
    description: 'A mysterious system with unusual properties.',
    imageName: 'Glorp.png'
  },
  'hondo': {
    name: 'Hondo',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A system with a strong martial tradition.',
    imageName: 'Hondo.png'
  },
  'ionos': {
    name: 'Ionos',
    type: SectorType.ANOMALY,
    isDangerous: true,
    description: 'A system with dangerous ionic storms.',
    imageName: 'Ionos.png'
  },
  'jurassi': {
    name: 'Jurassi',
    type: SectorType.DANGEROUS,
    isDangerous: true,
    description: 'A primitive system with dangerous megafauna.',
    imageName: 'Jurassi.png'
  },
  'lupin': {
    name: 'Lupin',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A wild system with pack-hunting species.',
    imageName: 'Lupin.png'
  },
  'magrath': {
    name: 'Magrath',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A magical system with mystical properties.',
    imageName: 'Magrath.png'
  },
  'revati': {
    name: 'Revati',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A prosperous trading system.',
    imageName: 'Revati.png'
  },
  'scintilla': {
    name: 'Scintilla',
    type: SectorType.CIVILIZED,
    isDangerous: false,
    description: 'A sparkling system known for its entertainment.',
    imageName: 'Scintilla.png'
  },
  'snacc': {
    name: 'Snacc',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A system specializing in food production.',
    imageName: 'Snacc.png'
  },
  'snodd': {
    name: 'Snodd',
    type: SectorType.UNKNOWN,
    isDangerous: false,
    description: 'An oddly named system with peculiar inhabitants.',
    imageName: 'Snodd.png'
  },
  'toblero': {
    name: 'Toblero',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A system known for its triangular space stations.',
    imageName: 'Toblero.png'
  },
  'wolfram': {
    name: 'Wolfram',
    type: SectorType.FRONTIER,
    isDangerous: false,
    description: 'A metallic system rich in rare minerals.',
    imageName: 'Wolfram.png'
  }
};

// Helper functions for working with sector assets
export const getSectorAsset = (name: string): SectorAsset | null => {
  const key = name.toLowerCase();
  return SECTOR_ASSETS[key] || null;
};

export const getAllSectorNames = (): string[] => {
  return Object.keys(SECTOR_ASSETS);
};

export const getSectorsByType = (type: SectorType): SectorAsset[] => {
  return Object.values(SECTOR_ASSETS).filter(asset => asset.type === type);
};

export const getRandomSector = (): SectorAsset => {
  const sectors = Object.values(SECTOR_ASSETS);
  return sectors[Math.floor(Math.random() * sectors.length)];
};

// Special assets for UI
export const BLANK_CARD = '!Blank.png';
export const BACK_CARD = '!Back.png';