
export interface ProcessedReactorData {
  country: string;
  plantName: string;
  type: string;
  capacityMW: number;
  constructionStartYear: number;
  constructionTimeYears: number;
  constructionTimePerGW: number;
}

export enum VisualizationMode {
  PER_REACTOR = 'per_reactor',
  PER_GIGAWATT = 'per_gigawatt',
}

export enum ColoringMode {
  TYPE = 'type',
  COUNTRY = 'country',
}
