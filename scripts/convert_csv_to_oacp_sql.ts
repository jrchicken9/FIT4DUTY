import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar: '"' | '\'' | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === quoteChar && line[i - 1] !== '\\') {
        inQuotes = false;
        quoteChar = null;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"' || ch === '\'') {
        inQuotes = true;
        quoteChar = ch as any;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function parsePythonList(listStr: string): string[] {
  const s = listStr.trim();
  if (!s.startsWith('[') || !s.endsWith(']')) return [];
  const inner = s.slice(1, -1);
  const items: string[] = [];
  let token = '';
  let inQuotes = false;
  let quoteChar: '"' | '\'' | null = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inQuotes) {
      if (ch === quoteChar && inner[i - 1] !== '\\') {
        inQuotes = false;
        // finalize token
        items.push(token);
        token = '';
      } else {
        token += ch;
      }
    } else {
      if (ch === '"' || ch === '\'') {
        inQuotes = true;
        quoteChar = ch as any;
      } else if (ch === ',') {
        // skip separators between items
      }
    }
  }
  return items;
}

function jsonArraySqlLiteral(arr: string[]): string {
  const json = JSON.stringify(arr);
  // Escape single quotes for SQL literal
  return `'${json.replace(/'/g, "''")}'`;
}

function main() {
  const csvPath = resolve(process.cwd(), 'oacp_written_test_questions.csv');
  const outPath = resolve(process.cwd(), 'supabase/migrations/20250816_seed_oacp_questions_from_csv.sql');
  const csv = readFileSync(csvPath, 'utf8');
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  // first line header
  const dataLines = lines.slice(1);
  const rows: { question: string; correct: string; incorrects: string[] }[] = [];
  for (const line of dataLines) {
    const [question, correct, incorrectRaw] = parseCsvLine(line);
    const incorrects = parsePythonList(incorrectRaw);
    if (question && correct && incorrects.length === 3) {
      rows.push({ question, correct, incorrects });
    }
  }

  let sql = '';
  sql += 'do $$\n';
  sql += 'declare\n  ver_id uuid;\nbegin\n';
  sql += "  select id into ver_id from public.test_versions where step_id = 'oacp' and is_active and published_at <= now() order by published_at desc limit 1;\n";
  sql += "  if ver_id is null then raise exception 'No active test_versions row found for step oacp'; end if;\n";
  sql += "  delete from public.test_questions where version_id = ver_id;\n";
  sql += '  insert into public.test_questions (version_id, order_index, prompt, choices, correct_index) values\n';
  sql += rows
    .map((r, idx) => {
      const choices = [r.correct, ...r.incorrects];
      const choicesLiteral = jsonArraySqlLiteral(choices);
      const prompt = r.question.replace(/'/g, "''");
      return `  (ver_id, ${idx + 1}, '${prompt}', ${choicesLiteral}::jsonb, 0)`;
    })
    .join(',\n');
  sql += ';\nend $$;\n';

  writeFileSync(outPath, sql, 'utf8');
  console.log(`Wrote ${rows.length} questions to ${outPath}`);
}

main();




