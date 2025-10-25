export interface Part {
  name: string;
  price: number;
}

export type PartCategory = 
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler';

export type PartsData = {
  [key in PartCategory]?: Part[];
};

export type BuildConfiguration = {
  [key in PartCategory]?: Part;
};

export interface CategoryInfo {
    key: PartCategory;
    sheetName: string;
    label: string;
}

// Types for AI-generated build options
export type AiBuildTier = 'Custo-Benefício' | 'Equilibrada' | 'Performance';

export interface AiBuildOption {
  tier: AiBuildTier;
  justificativa: string;
  cpu: string;
  motherboard: string;
  ram: string;
  gpu: string;
  storage: string;
  psu: string;
  case: string;
  cooler: string;
}

export interface ProcessedAiBuildOption {
  tier: AiBuildTier;
  justificativa: string;
  build: BuildConfiguration;
  totalCost: number;
}
