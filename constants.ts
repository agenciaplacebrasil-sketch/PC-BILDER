import type { CategoryInfo } from './types';

export const SHEET_ID = '1Pail5ZHyDS_lU8-_Ida_O39cZWAbRk0pHl2O_bb8Ng4';
export const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

export const CATEGORIES: CategoryInfo[] = [
  { key: 'cpu', sheetName: 'Processador', label: 'Processador (CPU)' },
  { key: 'motherboard', sheetName: 'Placa Mãe', label: 'Placa Mãe' },
  { key: 'ram', sheetName: 'Memoria RAM', label: 'Memória RAM' },
  { key: 'gpu', sheetName: 'Placa de Video', label: 'Placa de Vídeo (GPU)' },
  { key: 'storage', sheetName: 'Armazenamento', label: 'Armazenamento (SSD/HDD)' },
  { key: 'psu', sheetName: 'Fonte', label: 'Fonte de Alimentação (PSU)' },
  { key: 'case', sheetName: 'Gabinete', label: 'Gabinete' },
  { key: 'cooler', sheetName: 'Cooler', label: 'Cooler do Processador' },
];