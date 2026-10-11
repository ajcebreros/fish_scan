export interface FishTaxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface FishPhysicalCharacteristics {
  bodyShape: string;
  coloration: string;
  maxSize: string;
  distinctiveFeatures: string[];
}

export interface IdentificationClue {
  feature: string;
  description: string;
  confidence: number; // 0-100
}

export interface SimilarSpecies {
  commonName: string;
  filipinoName: string;
  scientificName: string;
  difference: string;
  image: string;
}

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Data Deficient';

export interface FishSpecies {
  id: string;
  commonName: string;
  filipinoName: string;
  localNames?: string[];
  scientificName: string;
  image: string;
  description: string;
  physicalCharacteristics: FishPhysicalCharacteristics;
  habitat: string;
  diet: string;
  distribution: string;
  conservationStatus: ConservationStatus;
  taxonomy: FishTaxonomy;
  similarSpecies: SimilarSpecies[];
  category: FishCategory;
}

export type FishCategory =
  | 'Reef Fish'
  | 'Pelagic'
  | 'Freshwater'
  | 'Demersal'
  | 'Cartilaginous';

export interface ScanResult {
  id: string;
  timestamp: number;
  imageData: string; // base64 data URL
  primaryMatch: FishSpecies;
  confidence: number; // 0-100
  estimatedLengthCm?: number;
  identificationClues: IdentificationClue[];
  isUncertain: boolean;
  possibleMatches: PossibleMatch[];
}

export interface PossibleMatch {
  species: FishSpecies;
  confidence: number;
  reason: string;
}

export type Screen =
  | 'home'
  | 'upload'
  | 'scanning'
  | 'results'
  | 'history'
  | 'explorer'
  | 'speciesDetail';
