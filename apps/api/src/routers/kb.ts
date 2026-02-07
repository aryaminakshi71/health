/**
 * KB (Knowledge Base) Router
 * 
 * Simplified router for knowledge base endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const kbRouter = {
  searchArticles: pub
    .route({
      method: 'GET',
      path: '/kb/search',
      summary: 'Search knowledge base articles',
      tags: ['Knowledge Base'],
    })
    .input(z.object({
      query: z.string(),
      category: z.string().optional(),
      limit: z.number().default(20),
    }))
    .output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
      lastUpdated: z.string(),
    })))
    .handler(async ({ input }) => {
      return [
        {
          id: 'kb_001',
          title: 'Patient Data Privacy Guidelines',
          summary: 'Best practices for handling patient data in compliance with HIPAA regulations',
          category: 'compliance',
          tags: ['HIPAA', 'privacy', 'data handling'],
          lastUpdated: '2026-01-15',
        },
        {
          id: 'kb_002',
          title: 'EHR System User Guide',
          summary: 'Complete guide to using the Electronic Health Records system',
          category: 'training',
          tags: ['EHR', 'training', 'guide'],
          lastUpdated: '2026-02-01',
        },
      ];
    }),

  getArticle: pub
    .route({
      method: 'GET',
      path: '/kb/articles/{articleId}',
      summary: 'Get a knowledge base article',
      tags: ['Knowledge Base'],
    })
    .input(z.object({ articleId: z.string() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      category: z.string(),
      tags: z.array(z.string()),
      author: z.string(),
      lastUpdated: z.string(),
      relatedArticles: z.array(z.object({
        id: z.string(),
        title: z.string(),
      })),
    }))
    .handler(async ({ input }) => {
      return {
        id: input.articleId,
        title: 'Patient Data Privacy Guidelines',
        content: '# Patient Data Privacy Guidelines\n\nThis article outlines best practices...',
        category: 'compliance',
        tags: ['HIPAA', 'privacy', 'data handling'],
        author: 'Compliance Team',
        lastUpdated: '2026-01-15',
        relatedArticles: [
          { id: 'kb_003', title: 'HIPAA Compliance Checklist' },
          { id: 'kb_004', title: 'Data Breach Response Protocol' },
        ],
      };
    }),

  getCategories: pub
    .route({
      method: 'GET',
      path: '/kb/categories',
      summary: 'Get knowledge base categories',
      tags: ['Knowledge Base'],
    })
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      articleCount: z.number(),
    })))
    .handler(async () => {
      return [
        { id: 'cat_001', name: 'Compliance', description: 'Regulatory compliance guidelines', articleCount: 25 },
        { id: 'cat_002', name: 'Training', description: 'Training materials and guides', articleCount: 40 },
        { id: 'cat_003', name: 'Technical', description: 'Technical documentation', articleCount: 30 },
      ];
    }),
};
