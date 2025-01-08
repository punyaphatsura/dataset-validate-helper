import Papa from 'papaparse';

interface DataRow {
  'thai sentence': string;
  'english sentence': string;
}

export const parseCsvFile = (file: File): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true, // Skips empty lines in the CSV
      error: (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      },
      complete: (result) => {
        if (result.errors.length > 0) {
          console.warn('Some rows were skipped due to errors:', result.errors);
        }
        // Filter out rows with errors
        const validData = result.data.filter((_, index) => {
          const rowError = result.errors.find((error) => error.row === index);
          return !rowError || rowError.type !== 'FieldMismatch';
        });
        resolve(validData as DataRow[]);
      },
    });
  });
};
