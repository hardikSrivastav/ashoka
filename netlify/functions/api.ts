import 'dotenv/config';
import { buildServer } from '../../src/server';
import { loadAll } from '../../src/services/dataLoader';
import { buildIndices, Indices } from '../../src/services/indices';
import { loadKeywords } from '../../src/services/assessmentTags';
import type { Handler } from '@netlify/functions';

let cachedServer: any = null;
let indices: Indices | null = null;

async function getServer() {
  if (cachedServer) {
    return cachedServer;
  }

  try {
    const csvDir = process.env.CSV_DIR ?? 'good csvs';
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

export const handler: Handler = async (event, context) => {
  try {
    const server = await getServer();
    
    const response = await server.inject({
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
      headers: event.headers,
      payload: event.body,
    });

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
