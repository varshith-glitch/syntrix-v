import { useState } from 'react';
import { read, utils } from 'xlsx';
import { ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar } from 'recharts';
import { Upload, Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopilotLink, field, Metric, PageFrame, Panel } from './WorkspacePrimitives';
import { parseCsv, parseRecords, toNumber, type Dataset, type Row } from '@/lib/dataset';

const demoRows: Row[] = Array.from({ length: 24 }, (_, i) => ({ Sample: `S-${String(i+1).padStart(2,'0')}`, 'Expression level': Math.round(14 + i * 1.9 + Math.sin(i * .9) * 8), 'Treatment dose': i * 2, 'Response score': Math.round(12 + i * 2 + Math.sin(i * 1.7) * 9) }));
const demo: Dataset = parseRecords(demoRows);
const DEMO_NAME = 'Sample expression · demo';
const types = ['Scatter', 'Line', 'Bar', 'Distribution'] as const;
type Kind = typeof types[number];
const grid = <CartesianGrid stroke="#304049" strokeDasharray="3 5" />;
const tip = <Tooltip contentStyle={{background:'#18242a', border:'1px solid #42515a'}} />;

function defaults(d: Dataset) {
  const x = d.numeric[0] ?? d.columns[0] ?? '';
  const y = d.numeric.find(c => c !== x) ?? d.numeric[0] ?? '';
  return { x, y };
}

export function DataLab() {
  const [dataset, setDataset] = useState<Dataset>(demo);
  const [name, setName] = useState(DEMO_NAME);
  const [error, setError] = useState('');
  const [kind, setKind] = useState<Kind>('Scatter');
  const [x, setX] = useState('Treatment dose');
  const [y, setY] = useState('Response score');
  const { rows, columns, numeric } = dataset;

  const load = (d: Dataset, label: string) => { const def = defaults(d); setDataset(d); setName(label); setX(def.x); setY(def.y); setError(''); };

  const parse = async (file: File) => { setError(''); try {
    if (file.size > 5_000_000) throw new Error('Use a file smaller than 5 MB.');
    let parsed: Dataset;
    if (/\.(csv|tsv|txt)$/i.test(file.name)) parsed = parseCsv(new TextDecoder('utf-8').decode(await file.arrayBuffer()));
    else if (/\.json$/i.test(file.name)) {
      let json: unknown;
      try { json = JSON.parse((await file.text()).replace(/^\uFEFF/, '')); } catch { throw new Error('The JSON file is not valid.'); }
      parsed = parseRecords(json);
    } else if (/\.xlsx?$/i.test(file.name)) {
      const workbook = read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ''];
      if (!sheet) throw new Error('The workbook has no sheets.');
      parsed = parseRecords(utils.sheet_to_json(sheet, { defval: null }));
    } else throw new Error('Upload a CSV, JSON, XLS or XLSX file.');
    load(parsed, file.name);
  } catch (e) { setError(e instanceof Error ? e.message : 'Could not read the file.'); } };

  const xNumeric = numeric.includes(x);
  const xOptions = kind === 'Scatter' ? numeric : columns;
  const needsX = kind !== 'Distribution';
  const points: Record<string, string | number>[] = rows.slice(0, 500).flatMap(row => {
    const yv = toNumber(row[y]); if (yv === null) return [];
    if (!needsX) return [{ [y]: yv }];
    const raw = row[x];
    if (xNumeric) { const xv = toNumber(raw); return xv === null ? [] : [{ [x]: xv, [y]: yv }]; }
    return raw == null || raw === '' ? [] : [{ [x]: String(raw), [y]: yv }];
  });
  const empty = !numeric.includes(y)
    ? (numeric.length ? 'Choose a numeric Y-axis column.' : 'This dataset has no numeric columns, so there is nothing to plot. Charts need at least one column of numbers.')
    : needsX && !columns.includes(x) ? 'Choose an X-axis column.'
    : kind === 'Scatter' && !xNumeric ? 'Scatter charts need a numeric X-axis column.'
    : !points.length ? 'No rows have values for the selected columns.' : '';
  const vals = points.map(p => Number(p[y]));
  const min = vals.length ? Math.min(...vals) : 0, max = vals.length ? Math.max(...vals) : 0, width = (max - min) / 10;
  const histogram = max === min ? [{ bin: `${min}`, count: vals.length }] : Array.from({ length: 10 }, (_, i) => ({ bin: `${+(min + i * width).toPrecision(3)}`, count: vals.filter(v => v >= min + i * width && (i === 9 ? v <= max : v < min + (i + 1) * width)).length }));
  const xAxis = <XAxis dataKey={x} type={xNumeric ? 'number' : 'category'} name={x} domain={['auto', 'auto']} stroke="#8296a0" tick={{fontSize: 11}} />;
  const yAxis = <YAxis dataKey={y} type="number" name={y} domain={['auto', 'auto']} stroke="#8296a0" tick={{fontSize: 11}} />;
  const setKindSafe = (t: Kind) => { setKind(t); if (t === 'Scatter' && !numeric.includes(x) && numeric[0]) setX(numeric.find(c => c !== y) ?? numeric[0]); };

  return <PageFrame code="LABORATORY / 01" title="Data Lab" description="A local-first workstation for exploring biological datasets. Your uploaded file stays in this browser session."><div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
    <Panel label="01 / DATASET" title="Source">
      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-primary/40 bg-primary/5 p-4 text-center text-xs text-muted-foreground hover:bg-primary/10"><Upload className="size-5 text-primary" /><span>Choose CSV, JSON, XLS or XLSX</span><input type="file" accept=".csv,.tsv,.txt,.json,.xls,.xlsx" className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void parse(file); e.target.value = ''; }} /></label>
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
      <div className="mt-5 break-words text-sm"><Database className="mb-2 size-4 text-primary" />{name}</div>
      {name !== DEMO_NAME && <Button variant="ghost" size="sm" onClick={() => load(demo, DEMO_NAME)} className="mt-2 text-xs"><X /> Reset to demo</Button>}
      <div className="mt-7 space-y-4">
        {needsX && <label className="block text-xs text-muted-foreground">X axis<select aria-label="X axis" value={xOptions.includes(x) ? x : ''} onChange={e => setX(e.target.value)} className={`mt-2 ${field}`}>{!xOptions.includes(x) && <option value="" disabled>{xOptions.length ? 'Select a column' : 'No suitable columns'}</option>}{xOptions.map(col => <option key={col} value={col}>{col}{numeric.includes(col) ? '' : ' (category)'}</option>)}</select></label>}
        <label className="block text-xs text-muted-foreground">Y axis{needsX ? '' : ' (values)'}<select aria-label="Y axis" value={numeric.includes(y) ? y : ''} onChange={e => setY(e.target.value)} className={`mt-2 ${field}`}>{!numeric.includes(y) && <option value="" disabled>{numeric.length ? 'Select a column' : 'No numeric columns'}</option>}{numeric.map(col => <option key={col} value={col}>{col}</option>)}</select></label>
        {!numeric.length && <p className="text-xs text-muted-foreground">No numeric columns were detected. Values must be plain numbers such as 12 or 3.5.</p>}
      </div>
    </Panel>
    <div className="min-w-0 space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="ROWS" value={rows.length.toLocaleString()} /><Metric label="COLUMNS" value={columns.length} detail={`${numeric.length} numeric`} /><Metric label="MODE" value="LOCAL" detail="No upload to server" /></div>
      <Panel label="02 / VISUALIZATION" title="Explore relationships">
        <div className="mb-5 flex flex-wrap gap-2">{types.map(type => <Button key={type} variant={type === kind ? 'secondary' : 'outline'} size="sm" onClick={() => setKindSafe(type)}>{type}</Button>)}</div>
        {empty ? <div role="status" className="flex h-[320px] items-center justify-center border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:h-[390px]">{empty}</div> :
        <div className="h-[320px] w-full min-w-0 sm:h-[390px]" role="img" aria-label={`${kind} chart of ${y}${needsX ? ` by ${x}` : ''}`}><ResponsiveContainer width="100%" height="100%">{
          kind === 'Scatter' ? <ScatterChart margin={{top: 15,right: 20,bottom: 16,left: 0}}>{grid}{xAxis}{yAxis}{tip}<Scatter data={points} fill="#71d9db" /></ScatterChart>
          : kind === 'Distribution' ? <BarChart data={histogram}>{grid}<XAxis dataKey="bin" stroke="#8296a0" tick={{fontSize: 11}} /><YAxis allowDecimals={false} stroke="#8296a0" tick={{fontSize: 11}} />{tip}<Bar dataKey="count" name={`${y} count`} fill="#a993dd" /></BarChart>
          : kind === 'Line' ? <LineChart data={xNumeric ? [...points].sort((a, b) => Number(a[x]) - Number(b[x])) : points}>{grid}{xAxis}{yAxis}{tip}<Line type="monotone" dataKey={y} stroke="#71d9db" dot={points.length < 2} /></LineChart>
          : <BarChart data={points.slice(0, 40)}>{grid}<XAxis dataKey={x} type="category" stroke="#8296a0" tick={{fontSize: 11}} />{yAxis}{tip}<Bar dataKey={y} fill="#6edcaf" /></BarChart>
        }</ResponsiveContainer></div>}
        <p className="mt-4 text-xs text-muted-foreground">Plotting {points.length.toLocaleString()} of {rows.length.toLocaleString()} rows (up to 500; rows missing a selected value are skipped). Charts are exploratory, not statistical proof.</p>
      </Panel>
      <Panel label="03 / TABLE" title="Dataset preview"><div className="overflow-x-auto"><table className="w-full min-w-max text-left text-xs"><thead><tr>{columns.map(col => <th key={col} className="border-b border-border p-3 font-mono text-primary">{col}</th>)}</tr></thead><tbody>{rows.slice(0,8).map((row,i) => <tr key={i} className="border-b border-border/50">{columns.map(col => <td key={col} className="p-3 text-muted-foreground">{String(row[col] ?? '—')}</td>)}</tr>)}</tbody></table></div></Panel>
      <CopilotLink prompt={`Help me interpret an exploratory dataset with ${rows.length} rows and columns ${columns.join(', ')}. Explain limitations; do not claim significance without statistical validation.`} label="Discuss analysis with Copilot" />
    </div>
  </div></PageFrame>;
}
