import 'dotenv/config';
import { buildServer } from './server';
import { loadAll } from './services/dataLoader';
import { buildIndices, Indices } from './services/indices';
import { loadKeywords } from './services/assessmentTags';

async function main() {
  const port = Number(process.env.PORT ?? 3000);
  const csvDir = process.env.CSV_DIR ?? 'good csvs';
  loadKeywords('config');

  const data = await loadAll(csvDir);
  let indices: Indices = buildIndices(data);
  const getIndices = () => indices;
  (getIndices as any).set = (i: Indices) => { indices = i; };

  const app = buildServer(getIndices, csvDir);
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
