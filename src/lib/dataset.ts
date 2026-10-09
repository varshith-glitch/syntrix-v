import Papa from 'papaparse';

export type Cell = string | number | boolean | null;
export type Row = Record<string, Cell>;
export type Dataset = { rows: Row[]; columns: string[]; numeric: string[] };

const NUM = /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i;

/** Converts a cell to a finite number, or null when it is missing or not numeric (never 0 by default). */
export function toNumber(value: Cell | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const s = value.trim();
  return NUM.test(s) ? Number(s) : null;
}

function isMissing(v: Cell | undefined) { return v == null || (typeof v === 'string' && v.trim() === ''); }

function uniqueHeaders(raw: unknown[]): string[] {
  const seen = new Map<string, number>();
  return raw.map((h, i) => {
    let name = String(h ?? '').replace(/^\uFEFF/, '').trim() || `Column ${i + 1}`;
    const n = seen.get(name) ?? 0; seen.set(name, n + 1);
    if (n) name = `${name} (${n + 1})`;
    return name;
  });
}

/** Normalizes records: trims strings, maps blanks to null, converts fully numeric columns to numbers. */
export function buildDataset(records: Row[], columns: string[]): Dataset {
  if (!columns.length) throw new Error('No columns were found in the file.');
  if (columns.length > 100) throw new Error('Use 1–100 columns.');
  if (!records.length) throw new Error('The file has a header but no data rows.');
  if (records.length > 10000) throw new Error('Maximum 10,000 rows.');
  const numeric = columns.filter(col => {
    const vals = records.map(r => r[col]).filter(v => !isMissing(v));
    return vals.length > 0 && vals.every(v => toNumber(v) !== null);
  });
  const rows = records.map(r => Object.fromEntries(columns.map(col => {
    const v = r[col];
    if (isMissing(v)) return [col, null];
    if (numeric.includes(col)) return [col, toNumber(v)];
    return [col, typeof v === 'string' ? v.trim().slice(0, 1000) : v ?? null];
  })) as Row);
  return { rows, columns, numeric };
}

export function parseCsv(text: string): Dataset {
  const clean = text.replace(/^\uFEFF/, '');
  if (!clean.trim()) throw new Error('The file is empty.');
  const result = Papa.parse<unknown[]>(clean, { header: false, skipEmptyLines: 'greedy', delimitersToGuess: [',', ';', '\t', '|'] });
  const fatal = result.errors.find(e => e.type === 'Quotes');
  if (fatal) throw new Error(`Malformed CSV near row ${(fatal.row ?? 0) + 1}: ${fatal.message}.`);
  const [head, ...body] = result.data;
  if (!head?.length) throw new Error('Could not find a header row.');
  const columns = uniqueHeaders(head);
  const bad = body.findIndex(r => r.length !== columns.length);
  if (bad >= 0) throw new Error(`Malformed CSV: data row ${bad + 1} has ${body[bad]!.length} fields but the header has ${columns.length}.`);
  const records = body.map(r => Object.fromEntries(columns.map((c, i) => [c, r[i] == null ? null : String(r[i])])) as Row);
  return buildDataset(records, columns);
}

export function parseRecords(records: unknown): Dataset {
  if (!Array.isArray(records) || !records.every(v => v && typeof v === 'object' && !Array.isArray(v))) throw new Error('Data must be an array of records.');
  const columns: string[] = [];
  for (const r of records as Record<string, unknown>[]) for (const k of Object.keys(r)) if (!columns.includes(k)) columns.push(k);
  const rows = (records as Record<string, unknown>[]).map(r => Object.fromEntries(columns.map(c => {
    const v = r[c];
    return [c, v == null || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' ? v ?? null : JSON.stringify(v)];
  })) as Row);
  return buildDataset(rows, columns);
}
