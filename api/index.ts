import 'dotenv/config';
import { buildServer } from '../src/server';
import { loadAll } from '../src/services/dataLoader';
import { buildIndices, Indices } from '../src/services/indices';
import { loadKeywords } from '../src/services/assessmentTags';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedServer: any = null;
let indices: Indices | null = null;

async function getServer() {
  if (cachedServer) {
    return cachedServer;
  }

  try {
    const csvDir = process.env.CSV_DIR ?? 'good-csvs';
    loadKeywords('config');

    if (!indices) {
      const data = await loadAll(csvDir);
      indices = buildIndices(data);
    }

    const getIndices = () => indices!;
    (getIndices as any).set = (i: Indices) => { indices = i; };

    cachedServer = buildServer(getIndices, csvDir);
    await cachedServer.ready();
    
    return cachedServer;
  } catch (error) {
    console.error('Failed to initialize server:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await getServer();
  await server.inject({
    method: req.method as any,
    url: req.url!,
    headers: req.headers as any,
    payload: req.body,
  }).then((response) => {
    res.status(response.statusCode);
    
    // Set headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });
    
    res.send(response.body);
  });
}
