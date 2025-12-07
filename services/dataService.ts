import { ProcessedReactorData } from '../types';
import Papa from 'papaparse';

const COUNTRIES = [
  'Argentina', 'Armenia', 'Austria', 'Bangladesh', 'Belarus', 'Belgium', 'Brazil',
  'Bulgaria', 'Canada', 'China', 'Cuba', 'Czech_Republic', 'Egypt', 'Finland', 'France',
  'Germany', 'Hungary', 'India', 'Iran', 'Italy', 'Japan', 'Kazakhstan', 'Lithuania',
  'Mexico', 'Netherlands', 'North_Korea', 'Pakistan', 'Philippines', 'Poland',
  'Romania', 'Russia', 'Slovakia', 'Slovenia', 'South_Africa', 'South_Korea', 'Spain',
  'Sweden', 'Switzerland', 'Taiwan', 'Turkey', 'Ukraine', 'United_Arab_Emirates',
  'United_Kingdom', 'United_States', 'Uzbekistan'
];

// Используем PapaParse вместо ручного split
const parseCSV = (csvText: string): Record<string, string>[] => {
  const normalizeHeader = (header: string) =>
    header.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, '').trim();

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (header) => normalizeHeader(header),
  });

  if (result.errors.length) {
    console.warn('PapaParse errors:', result.errors);
  }

  // Papa уже вернул массив объектов: { "Plant name": "...", ... }
  return result.data;
};

const FIELD_KEYS = {
  plantName: 'Plant name',
  unitNo: 'Unit No.',
  type: 'Type',
  beginBuilding: 'Begin building',
  commercialOperation: 'Commercial operation',
  capacity: 'Capacity',
};

const processRawData = (rawData: Record<string, string>[], countryName: string): ProcessedReactorData[] => {
  const processed: ProcessedReactorData[] = [];
  const monthYearFormatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

  const cleanDateString = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    // Removes citations like [160] and parenthesized content like (2026) to clean up date fields
    return dateStr.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, '').trim();
  };

  for (const row of rawData) {
    const beginBuilding = cleanDateString(row[FIELD_KEYS.beginBuilding]);
    const commercialOp = cleanDateString(row[FIELD_KEYS.commercialOperation]);
    const capacityStr = row[FIELD_KEYS.capacity];
    
    if (!beginBuilding || !commercialOp || !capacityStr || isNaN(parseFloat(capacityStr))) {
      continue;
    }

    const startDate = new Date(beginBuilding);
    const endDate = new Date(commercialOp);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
      continue;
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const constructionTimeYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    const capacityMW = parseFloat(capacityStr);
    const capacityGW = capacityMW / 1000;
    const constructionTimePerGW = capacityGW > 0 ? constructionTimeYears / capacityGW : 0;

    processed.push({
      country: countryName.replace(/_/g, ' '),
      plantName: `${row[FIELD_KEYS.plantName]} ${row[FIELD_KEYS.unitNo]}`,
      type: row[FIELD_KEYS.type] || 'Unknown',
      capacityMW,
      constructionStartYear: startDate.getFullYear(),
      constructionEndDate: monthYearFormatter.format(endDate),
      constructionTimeYears,
      constructionTimePerGW,
    });
  }

  return processed;
};

export const loadReactorData = async (): Promise<ProcessedReactorData[]> => {
  try {
    const allDataPromises = COUNTRIES.map(async (country) => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/${country}.csv`);
        if (!response.ok) {
          console.warn(`Failed to fetch ${country}.csv, status: ${response.status}`);
          return [];
        }
        const csvText = await response.text();
        const rawData = parseCSV(csvText);
        return processRawData(rawData, country);
      } catch (error) {
        console.error(`Error processing data for ${country}:`, error);
        return [];
      }
    });

    const allDataArrays = await Promise.all(allDataPromises);
    return allDataArrays.flat();
  } catch (error) {
    console.error("Error loading reactor data:", error);
    return [];
  }
};
