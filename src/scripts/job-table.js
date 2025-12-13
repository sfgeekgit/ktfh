#!/usr/bin/env node
// Run with: node scripts/job-table.js   (from the repo root)
/**
 * Quick CLI to print a tabular view of job definitions.
 * Tweak `filterPath` and `sortBy` below to change what is displayed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import ts from 'typescript';

// --- CONFIG ---
// Set to a path string (e.g., "med" or "clim") or an array of paths to filter to those.
// Set to false to show every job.
//const filterPath = ['med', 'clim'];
//const filterPath = 'clim';
const filterPath = false;

// Sort by one or more keys (first wins, then next on ties).
// Keys: id | displayName | chapter | path | order (order = original file order)
const sortBy = ['path', 'order', 'id'];

// Whether to also print a tree view (grouped by path).
const showTree = true;

// Training run filter: "ignore" to drop them, "only" to keep only them, "all" for everything.
//const trainingRuns = 'ignore'; // one of: 'ignore' | 'only' | 'all'
//const trainingRuns = 'all'; // one of: 'ignore' | 'only' | 'all'
const trainingRuns = 'ignore'; // one of: 'ignore' | 'only' | 'all'

// EDIT/REAPPLY WORKFLOW (for future assistants):
// 1) Run: node scripts/job-table.js > jobs-table.txt
// 2) Edit numeric cells in jobs-table.txt (GPU, dur, pay$, payd, unl$, unlD, cost$, dcost, etc.).
//    Do NOT change path or id columns; those anchor rows back to src/data/jobTypes.ts.
// 3) Ask: “apply the edits from jobs-table.txt back to src/data/jobTypes.ts”.
//    The assistant should diff by id and update matching fields in the source.
// --- END CONFIG ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJobTypes() {
  const tsPath = path.resolve(__dirname, '../data/jobTypes.ts');
  const source = fs.readFileSync(tsPath, 'utf8');

  // Transpile to CommonJS and eval in a local module scope.
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: tsPath,
  });

  const module = { exports: {} };
  const tsAwareRequire = (id) => tsRequire(id, tsPath);
  const fn = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    outputText,
  );
  fn(module.exports, tsAwareRequire, module, tsPath, path.dirname(tsPath));
  return module.exports.JOB_TYPES || [];
}

function tsRequire(id, parentPath) {
  const resolver = createRequire(pathToFileURL(parentPath));
  let resolved;
  try {
    resolved = resolver.resolve(id);
  } catch {
    const tsPath = path.resolve(path.dirname(parentPath), `${id}.ts`);
    if (!fs.existsSync(tsPath)) {
      throw new Error(`Cannot resolve ${id} from ${parentPath}`);
    }
    resolved = tsPath;
  }
  if (resolved.endsWith('.ts')) {
    const src = fs.readFileSync(resolved, 'utf8');
    const { outputText } = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
      fileName: resolved,
    });
    const module = { exports: {} };
    const localRequire = (childId) => tsRequire(childId, resolved);
    const fn = new Function(
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
      outputText,
    );
    fn(module.exports, localRequire, module, resolved, path.dirname(resolved));
    return module.exports;
  }
  return resolver(resolved);
}

const filterPaths = !filterPath
  ? null
  : Array.isArray(filterPath)
    ? filterPath.filter(Boolean)
    : [filterPath];

const jobs = loadJobTypes()
  .map((job, idx) => ({ ...job, __order: idx })) // keep file order for sorting
  .filter((job) => (filterPaths ? filterPaths.includes(job.path) : true))
  .filter((job) => {
    const isTr = job.id?.startsWith('trun');
    if (trainingRuns === 'ignore') return !isTr;
    if (trainingRuns === 'only') return isTr;
    return true; // 'all'
  });

const sortKeys = Array.isArray(sortBy) ? sortBy : [sortBy];
const sorted = [...jobs].sort((a, b) => {
  for (const key of sortKeys) {
    const av = key === 'order' ? a.__order : a[key];
    const bv = key === 'order' ? b.__order : b[key];
    if (av === bv) continue;
    if (typeof av === 'number' && typeof bv === 'number') {
      return av - bv;
    }
    return String(av ?? '').localeCompare(String(bv ?? ''));
  }
  return 0;
});

const cols = [
  { key: 'path', title: 'path', fmt: (j) => j.path ?? '' },
  { key: 'id', title: 'id', fmt: (j) => j.id },
  {
    key: 'name',
    title: 'name',
    fmt: (j) => (j.displayName || '').slice(0, 20),
  },
  { key: 'GPU', title: 'GPU', fmt: (j) => getCost(j.cost, 'compute') },
  { key: 'dur', title: 'dur', fmt: (j) => (j.duration?.min ?? '') },
  {
    key: 'unl$',
    title: 'unl_$',
    fmt: (j) => getCost(j.unlockCost, 'money'),
  },
  {
    key: 'unlD',
    title: 'unl_D',
    fmt: (j) => getCost(j.unlockCost, 'data'),
  },
  { key: 'payd', title: 'pay_d', fmt: (j) => getPayout(j, 'data') },
  { key: 'pay$', title: 'pay_$', fmt: (j) => getPayout(j, 'money') },
  { key: 'cost$', title: 'run_$', fmt: (j) => getCost(j.cost, 'money') },
  { key: 'dcost', title: 'run_d', fmt: (j) => getCost(j.cost, 'data') },
  { key: 'mI', title: 'mI', fmt: (j) => getStatRequirement(j, ['iq']), width: 2 },
  { key: 'mG', title: 'mG', fmt: (j) => getStatRequirement(j, ['generality']), width: 2 },
  { key: 'mA', title: 'mA', fmt: (j) => getStatRequirement(j, ['auto', 'autonomy']), width: 2 },
  { key: '+I', title: '+I', fmt: (j) => getStatPlusOne(j, ['iq']), width: 2 },
  { key: '+G', title: '+G', fmt: (j) => getStatPlusOne(j, ['generality']), width: 2 },
  { key: '+A', title: '+A', fmt: (j) => getStatPlusOne(j, ['auto', 'autonomy']), width: 2 },
  {
    key: 'W',
    title: 'W',
    fmt: (j) => (j.is_wonder ? 'Y' : ''),
    width: 1,
  },
  {
    key: 'O',
    title: 'O',
    fmt: (j) => (j.category === 'onetime' ? 'X' : ''),
    width: 1,
  },
];

const table = [cols.map((c) => c.title), cols.map((c) => '-'.repeat(Math.max(c.width ?? c.title.length, (c.title || '').length)))];
sorted.forEach((job) => {
  table.push(
    cols.map((c) => {
      const raw = c.fmt(job);
      return raw === undefined || raw === null ? '' : String(raw);
    }),
  );
});

const colWidths = cols.map((c, idx) =>
  Math.max(...table.map((row) => (row[idx] ?? '').length), c.width ?? 0, c.title.length),
);

const lines = table.map((row) =>
  row
    .map((cell, idx) => cell.padEnd(colWidths[idx], ' '))
    .join(' | '),
);

console.log(lines[0]);
console.log(lines[1]);
lines.slice(2).forEach((l) => console.log(l));

if (showTree) {
  const byPath = new Map();
  sorted.forEach((job) => {
    const key = job.path || '(none)';
    if (!byPath.has(key)) byPath.set(key, []);
    byPath.get(key).push(job);
  });

  byPath.forEach((jobsForPath, key) => {
    console.log('\n' + key);
    printTree(jobsForPath);
  });
}

printDocs();

function getCost(list, type) {
  if (!Array.isArray(list)) return '';
  const item = list.find((c) => c.type === type);
  return item?.value ?? '';
}

function getPayout(job, type) {
  if (!Array.isArray(job.payout)) return '';
  const item = job.payout.find((p) => p.type === type);
  return item?.min ?? '';
}

function getStatRequirement(job, types) {
  const prereqs = combinePrereqs(job);
  const item = prereqs.find((p) => types.includes(p.type));
  if (!item) return '';
  const val = item.value ?? item.min;
  return val ?? '';
}

function getStatPlusOne(job, types) {
  if (!Array.isArray(job.payout)) return '';
  const item = job.payout.find((p) => types.includes(p.type));
  if (!item) return '';
  const val = item.min ?? item.value;
  return val === 1 ? '+1' : '';
}

function printTree(jobsForPath) {
  const byId = new Map(jobsForPath.map((j) => [j.id, j]));
  const parent = new Map();
  const children = new Map();
  jobsForPath.forEach((j) => {
    const p = getParentId(j, byId);
    if (p) parent.set(j.id, p);
    if (!children.has(p)) children.set(p, []);
    children.get(p).push(j);
  });

  const roots = children.get(undefined) || [];
  const sortFn = (a, b) => (a.__order ?? 0) - (b.__order ?? 0);
  const traverse = (nodes, prefix = '') => {
    nodes.sort(sortFn).forEach((node, idx) => {
      const isLast = idx === nodes.length - 1;
      const branch = isLast ? '└── ' : '├── ';
      const label = formatLabel(node);
      console.log(`${prefix}${branch}${label}`);
      const kids = children.get(node.id) || [];
      if (kids.length) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        traverse(kids, nextPrefix);
      }
    });
  };

  traverse(roots);
}

function getParentId(job, byId) {
  const candidates = combinePrereqs(job);
  const prereqJob = candidates.find((p) => p.type === 'job' && typeof p.value === 'string');
  if (!prereqJob) return undefined;
  return byId.has(prereqJob.value) ? prereqJob.value : undefined;
}

function combinePrereqs(job) {
  const combined = [];
  if (Array.isArray(job.prereq)) combined.push(...job.prereq);
  if (Array.isArray(job.displayTrigger)) combined.push(...job.displayTrigger);
  return combined;
}

function formatLabel(job) {
  const name = job.displayName || job.id;
  const chapter = formatChapter(job.chapter);
  const unlockMoney = getUnlockMoney(job);
  const prereqs = formatPrereqs(combinePrereqs(job), job);
  const wonder = job.is_wonder ? ' [WONDER]' : '';
  const unlockPart = unlockMoney ? ` - unlock$: ${unlockMoney}` : '';
  const prereqPart = prereqs ? ` -        prereq: ${prereqs}` : '';
  const chapterPart = chapter ? ` (ch${chapter})` : '';
  return `${name}${chapterPart}${unlockPart}${prereqPart}${wonder}`;
}

function formatChapter(chapter) {
  if (Array.isArray(chapter) && chapter.length) {
    return Math.min(...chapter);
  }
  if (typeof chapter === 'number') return chapter;
  return '';
}

function formatPrereqs(prereqs, job) {
  if (!prereqs || !prereqs.length) return '';
  return prereqs
    .map((p) => formatPrereq(p, job))
    .filter(Boolean)
    .join(', ');
}

function formatPrereq(p, job) {
  if (!p) return '';
  const t = p.type;
  const v = p.value;
  const valStr = typeof v === 'number' || typeof v === 'string' ? v : '';
  switch (t) {
    case 'job':
      // Skip job prereqs in the text; the tree itself encodes them.
      return '';
    case 'money':
      return `money>=${valStr}`;
    case 'data':
      return `data>=${valStr}`;
    case 'compute':
      return `gpu>=${valStr}`;
    case 'iq':
    case 'autonomy':
    case 'generality':
    case 'wonder':
      return `${t}>=${valStr}`;
    case 'choice':
      return `choice:${valStr}`;
    case 'completedJob':
      return `done:${valStr}`;
    default:
      return `${t}:${valStr}`;
  }
}

function getUnlockMoney(job) {
  return getCost(job.unlockCost, 'money') || '';
}

function printDocs() {
  const docs = [
    '',
    'Column mapping (apply edits back to src/data/jobTypes.ts):',
    '  path   -> job.path',
    '  id     -> job.id (do not change in edited tables)',
    '  name   -> job.displayName (truncated in output; ignore when syncing)',
    '  unl$   -> unlockCost money (single value)',
    '  unlD   -> unlockCost data (single value)',
    '  GPU    -> cost compute (per-run)',
    '  cost$  -> cost money (per-run)',
    '  dcost  -> cost data (per-run)',
    '  pay$   -> payout money (min)',
    '  payd   -> payout data (min)',
    '  dur    -> duration.min (normally set max to floor(min * 1.25))',
    '  mI/mG/mA -> prereq min iq/generality/autonomy (blank if none)',
    '  +I/+G/+A -> +1 iq/generality/autonomy payout flags',
    '  W      -> is_wonder flag',
    '  O      -> category: onetime (X if onetime)',
    '  Note: max values should default to floor(min * 1.25) for dur, cost$, dcost when syncing back.',
    '  Payout max is derived in-game: if min<=5, max=min; otherwise max=floor(min*1.3).',
    '',
    'Workflow reminder for future assistants:',
    '  - ALWAYS confirm each change with the user before modifying jobTypes.ts.',
    '  - Diff the edited table rows by id, then update the mapped fields above.',
    '  - Leave path/id untouched as anchors; ignore name truncation.',
  ];
  docs.forEach((line) => console.log(line));
}
