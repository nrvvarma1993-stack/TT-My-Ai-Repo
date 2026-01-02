// Required packages (install these in your project):
// npm install papaparse xlsx
// (optional) for TypeScript types: npm install -D @types/papaparse

import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Row = Record<string, any>;

function App(): JSX.Element {
  const [data, setData] = useState<Row[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState<boolean>(false);

  const clear = useCallback(() => {
    setData([]);
    setFileName(null);
    setError(null);
    setParsing(false);
  }, []);

  const parseCSV = useCallback((file: File) => {
    setParsing(true);
    setError(null);

    // Use PapaParse for robust CSV parsing. Configs chosen to handle headers,
    // dynamic typing (numbers/booleans), skip empty lines, trim headers.
    Papa.parse<Row>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      worker: true, // parse in a separate thread for large files
      transformHeader: (h) => h?.trim(),
      // 'complete' fired after parsing finished
      complete: (results) => {
        // results.data is Array<Row> when header=true
        setData(Array.isArray(results.data) ? results.data : []);
        setParsing(false);
      },
      error: (err) => {
        setError(`CSV parse error: ${err.message}`);
        setParsing(false);
      },
    });
  }, []);

  const parseExcel = useCallback((file: File) => {
    setParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dataBuffer = e.target?.result;
        if (!dataBuffer) throw new Error('No data read from file');

        // Read workbook
        const workbook = XLSX.read(dataBuffer, { type: 'array' });
        // Take the first sheet by default
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Workbook contains no sheets');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert sheet to JSON with header row detection. defval keeps empty cells as null.
        const json: Row[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        setData(Array.isArray(json) ? json : []);
      } catch (err: any) {
        setError(`Excel parse error: ${err?.message ?? String(err)}`);
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the Excel file');
      setParsing(false);
    };

    // Read as array buffer; required by xlsx to parse binary Excel formats.
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFile = useCallback((file: File | null) => {
    clear();
    if (!file) return;
    setFileName(file.name);

    const name = file.name.toLowerCase();

    // Determine file type by extension (fallback to mime in some cases)
    if (name.endsWith('.csv') || file.type === 'text/csv') {
      parseCSV(file);
      return;
    }

    if (
      name.endsWith('.xls') ||
      name.endsWith('.xlsx') ||
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      parseExcel(file);
      return;
    }

    // Fallback: try CSV parse first (many CSVs come with different mime types)
    parseCSV(file);
  }, [clear, parseCSV, parseExcel]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
  }, [handleFile]);

  // Render a quick preview table for the parsed data (first N rows)
  const PreviewTable = ({ rows }: { rows: Row[] }) => {
    if (!rows || rows.length === 0) return <div>No data to preview</div>;

    const columns = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );

    const previewRows = rows.slice(0, 100); // only show up to 100 rows for performance

    return (
      <div style={{ overflowX: 'auto', maxHeight: '60vh' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>#</th>
              {columns.map((col) => (
                <th key={col} style={{ border: '1px solid #ddd', padding: '8px' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{i + 1}</td>
                {columns.map((col) => (
                  <td key={col} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > previewRows.length && (
          <div style={{ marginTop: 8 }}>
            Showing first {previewRows.length} of {rows.length} rows
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <h1>File Importer (CSV & Excel)</h1>
      <p>
        This component supports robust CSV parsing (using PapaParse) and Excel (.xls/.xlsx)
        parsing (using xlsx). See the top of this file for the install instructions.
      </p>

      <div style={{ margin: '12px 0' }}>
        <input
          type="file"
          accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onInputChange}
        />
        <button onClick={clear} style={{ marginLeft: 12 }}>Clear</button>
      </div>

      {parsing && <div>Parsing {fileName ?? 'file'} ...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {data.length > 0 && (
        <div>
          <h2>Preview — {fileName}</h2>
          <div>Rows parsed: {data.length}</div>
          <PreviewTable rows={data} />
        </div>
      )}

      {data.length === 0 && !parsing && !error && <div>No file loaded</div>}
    </div>
  );
}

export default App;
