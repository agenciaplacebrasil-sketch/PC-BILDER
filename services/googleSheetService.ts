import { BASE_URL, CATEGORIES } from '../constants';
import type { Part, PartsData } from '../types';

const parsePrice = (priceString: string): number => {
  if (!priceString || typeof priceString !== 'string') return 0;
  const cleanedString = priceString
    .replace('R$', '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const price = parseFloat(cleanedString);
  return isNaN(price) ? 0 : price;
};

/**
 * Waits for the PapaParse library to be available on the window object,
 * with a timeout to prevent infinite polling.
 * This prevents race conditions where the app tries to use the library
 * before the external script has loaded.
 * @returns A promise that resolves with the PapaParse object.
 */
const getPapaParse = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds timeout (50 * 100ms)

    const checkPapa = () => {
      if ((window as any).Papa) {
        resolve((window as any).Papa);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkPapa, 100);
      } else {
        reject(new Error("A biblioteca de análise de dados não pôde ser carregada."));
      }
    };
    checkPapa();
  });
};


const fetchSheetData = (sheetName: string): Promise<Part[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const Papa = await getPapaParse();
      // Add a cache-busting query parameter to ensure fresh data is fetched every time.
      const url = `${BASE_URL}${encodeURIComponent(sheetName)}&_=${new Date().getTime()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`A resposta da rede não foi bem-sucedida para a planilha: ${sheetName}`);
      }
      const csvText = await response.text();

      // Pre-process the CSV text to remove Google Sheet's malformed empty rows.
      // These rows often look like `","",""` and are not filtered by `skipEmptyLines`.
      // A valid line must contain at least one letter or number.
      const lines = csvText.split('\n');
      const cleanedCsvText = lines.filter(line => /[a-zA-Z0-9]/.test(line)).join('\n');
      
      Papa.parse(cleanedCsvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: { data: any[], meta: { fields: string[] }, errors: any[] }) => {
          if (results.errors.length > 0) {
            console.error(`Errors parsing sheet ${sheetName}:`, results.errors);
          }
            
          const fields = results.meta.fields;
          if (!fields || fields.length < 2) {
            console.warn(`No valid headers found in sheet: ${sheetName}`);
            resolve([]); // Resolve with empty array if no headers
            return;
          }

          const nameKey = fields[0]; // Assume the first column is the part name.
          const priceKey = fields[1]; // Reverted: Assume the second column is the price (Custo).

          const parts = results.data.map((row: any) => {
            const name = row[nameKey];
            const price = parsePrice(row[priceKey]);
            if (name && price > 0) {
              return { name, price };
            }
            return null;
          }).filter((part): part is Part => part !== null);
          
          resolve(parts);
        },
        error: (error: Error) => {
          reject(new Error(`Erro ao analisar a planilha ${sheetName}: ${error.message}`));
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const fetchPartsData = async (): Promise<PartsData> => {
    const allPromises = CATEGORIES.map(category => 
        fetchSheetData(category.sheetName).then(parts => ({ key: category.key, parts }))
    );

    const results = await Promise.all(allPromises);

    const partsData: PartsData = {};
    results.forEach(result => {
        partsData[result.key] = result.parts;
    });

    return partsData;
};