import { FastifyInstance } from 'fastify';
import { loadAll } from '../services/dataLoader';
import { buildIndices, Indices } from '../services/indices';
import { loadSectionAnalysis, setAnalysis } from '../services/sectionAnalysisStore';
import { analyzeSectionWithLLM } from '../services/sectionAnalyzer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AnthropicModule = (() => { try { const m = require('@anthropic-ai/sdk'); return m.default ?? m; } catch { return null; } })();

export async function registerAdminRoutes(app: FastifyInstance, state: { csvDir: string; setIndices: (i: Indices) => void }) {
  app.post('/admin/reload', async () => {
    const data = await loadAll(state.csvDir);
    const indices = buildIndices(data);
    state.setIndices(indices);
    return {
      reloaded: true,
      counts: {
        courses: data.schedule.length,
        sections: data.sections.length,
        ratings: data.ratings.length,
        faculties: data.faculties.length,
      },
    };
  });

  app.post('/admin/enrich/sections', async () => {
    if (!AnthropicModule) return { error: 'Anthropic SDK not installed' };
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { error: 'ANTHROPIC_API_KEY not set' };
    const anthropic = new (AnthropicModule as any)({ apiKey });
    loadSectionAnalysis();
    const data = await loadAll(state.csvDir);
    const sections = data.sections;
    let enriched = 0;
    for (const s of sections) {
      await analyzeSectionWithLLM(s, anthropic);
      enriched++;
    }
    return { enriched };
  });
}
