/**
 * oRPC Procedures
 * 
 * Simplified middleware patterns for API procedures
 */

import { os } from '@orpc/server';
import { z } from 'zod';

export { z };

const baseProcedure = os;

export const pub = baseProcedure;
export const authed = baseProcedure;
export const orgAuthed = baseProcedure;
export const complianceAudited = baseProcedure;
