/**
 * Tickets Router
 * 
 * Simplified router for support tickets/endpoints
 */

import { z } from 'zod';
import { pub } from '../procedures';

export const ticketsRouter = {
  getTickets: pub
    .route({
      method: 'GET',
      path: '/tickets',
      summary: 'Get support tickets',
      tags: ['Tickets'],
    })
    .input(z.object({
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: z.string().optional(),
      createdBy: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .output(z.object({
      tickets: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        createdBy: z.object({
          id: z.string(),
          name: z.string(),
          role: z.string(),
        }),
        assignedTo: z.object({
          id: z.string(),
          name: z.string(),
        }).optional(),
        category: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        resolvedAt: z.string().optional(),
      })),
      total: z.number(),
      page: z.number(),
    }))
    .handler(async () => {
      return {
        tickets: [
          {
            id: 'ticket_001',
            title: 'EHR system slow performance',
            description: 'The EHR system is taking too long to load patient records',
            status: 'in-progress' as const,
            priority: 'high' as const,
            createdBy: { id: 'user_456', name: 'Dr. Wilson', role: 'physician' },
            assignedTo: { id: 'user_789', name: 'IT Support' },
            category: 'Technical',
            createdAt: '2026-02-06T09:00:00Z',
            updatedAt: '2026-02-07T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
      };
    }),

  createTicket: pub
    .route({
      method: 'POST',
      path: '/tickets',
      summary: 'Create a support ticket',
      tags: ['Tickets'],
    })
    .input(z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      category: z.string(),
      attachments: z.array(z.string()).optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      ticketId: z.string(),
      createdAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        ticketId: `ticket_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }),

  getTicket: pub
    .route({
      method: 'GET',
      path: '/tickets/{ticketId}',
      summary: 'Get a support ticket',
      tags: ['Tickets'],
    })
    .input(z.object({ ticketId: z.string() }))
    .output(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      createdBy: z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
        email: z.string(),
      }),
      assignedTo: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }).optional(),
      category: z.string(),
      messages: z.array(z.object({
        id: z.string(),
        sender: z.object({
          id: z.string(),
          name: z.string(),
        }),
        content: z.string(),
        attachments: z.array(z.string()).optional(),
        createdAt: z.string(),
      })),
      createdAt: z.string(),
      updatedAt: z.string(),
      resolvedAt: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      return {
        id: input.ticketId,
        title: 'EHR system slow performance',
        description: 'The EHR system is taking too long to load patient records',
        status: 'in-progress' as const,
        priority: 'high' as const,
        createdBy: { id: 'user_456', name: 'Dr. Wilson', role: 'physician', email: 'dr.wilson@clinic.com' },
        assignedTo: { id: 'user_789', name: 'IT Support', email: 'it@clinic.com' },
        category: 'Technical',
        messages: [
          {
            id: 'msg_001',
            sender: { id: 'user_456', name: 'Dr. Wilson' },
            content: 'The EHR system has been very slow today when loading patient records.',
            createdAt: '2026-02-06T09:00:00Z',
          },
          {
            id: 'msg_002',
            sender: { id: 'user_789', name: 'IT Support' },
            content: 'Thank you for reporting this. We are investigating the issue.',
            createdAt: '2026-02-06T09:30:00Z',
          },
        ],
        createdAt: '2026-02-06T09:00:00Z',
        updatedAt: '2026-02-06T09:30:00Z',
      };
    }),

  addTicketMessage: pub
    .route({
      method: 'POST',
      path: '/tickets/{ticketId}/messages',
      summary: 'Add a message to a ticket',
      tags: ['Tickets'],
    })
    .input(z.object({
      ticketId: z.string(),
      content: z.string(),
      attachments: z.array(z.string()).optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      messageId: z.string(),
      createdAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }),

  updateTicketStatus: pub
    .route({
      method: 'PATCH',
      path: '/tickets/{ticketId}',
      summary: 'Update ticket status',
      tags: ['Tickets'],
    })
    .input(z.object({
      ticketId: z.string(),
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      updatedAt: z.string(),
    }))
    .handler(async ({ input }) => {
      return {
        success: true,
        updatedAt: new Date().toISOString(),
      };
    }),
};
