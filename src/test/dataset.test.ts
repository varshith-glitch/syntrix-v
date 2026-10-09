import { describe, it, expect } from 'vitest';
import { parseCsv, toNumber } from '@/lib/dataset';

describe('parseCsv', () => {
  it('parses headers, quotes, BOM and all rows', () => {
    const csv = '\uFEFFid,name,dose,score\r\n' + Array.from({ length: 8 }, (_, i) => `${i},"Gene, ${i}\nline",${i * 2},${i + 0.5}`).join('\r\n') + '\r\n';
    const d = parseCsv(csv);
    expect(d.rows.length).toBe(8);
    expect(d.columns).toEqual(['id', 'name', 'dose', 'score']);
    expect(d.numeric).toEqual(['id', 'dose', 'score']);
    expect(d.rows[1]!.name).toBe('Gene, 1\nline');
  });
  it('handles missing values without zeros and single rows', () => {
    const d = parseCsv('a,b\n1,\n,3\n');
    expect(d.rows).toEqual([{ a: 1, b: null }, { a: null, b: 3 }]);
    expect(parseCsv('a,b\n1,2').rows.length).toBe(1);
  });
  it('detects semicolons and rejects malformed rows', () => {
    expect(parseCsv('a;b\n1;2\n3;4').rows.length).toBe(2);
    expect(() => parseCsv('a,b\n1,2,3')).toThrow(/Malformed/);
    expect(() => parseCsv('a,b\n')).toThrow(/no data rows/);
  });
  it('toNumber', () => { expect(toNumber('x')).toBeNull(); expect(toNumber('')).toBeNull(); expect(toNumber(' 2.5 ')).toBe(2.5); });
});
