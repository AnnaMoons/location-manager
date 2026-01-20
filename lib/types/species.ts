export type Species = 'pigs' | 'broilers' | 'layers';

export type LocationType = 'farm' | 'barn' | 'pen' | 'section' | 'cage';

export interface SpeciesHierarchy {
  name: string;
  levels: LocationType[];
  labels: Record<LocationType, string>;
}

export type SpeciesHierarchies = Record<Species, SpeciesHierarchy>;

export const speciesHierarchies: SpeciesHierarchies = {
  pigs: {
    name: 'Cerdos',
    levels: ['farm', 'barn', 'pen'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
  broilers: {
    name: 'Pollos de engorde',
    levels: ['farm', 'barn', 'section'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
  layers: {
    name: 'Ponedoras',
    levels: ['farm', 'barn'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
};

export function getAvailableTypesForSpecies(species: Species): LocationType[] {
  return speciesHierarchies[species].levels;
}

export function getNextLevelType(species: Species, currentType: LocationType): LocationType | null {
  const levels = speciesHierarchies[species].levels;
  const currentIndex = levels.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null;
  }
  return levels[currentIndex + 1];
}

export function canHaveChildren(species: Species, type: LocationType): boolean {
  const levels = speciesHierarchies[species].levels;
  const index = levels.indexOf(type);
  return index !== -1 && index < levels.length - 1;
}
