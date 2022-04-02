import { PrismaClient } from '@prisma/client';

export const server__processTaskSecret = process.env.PROCESS_TASK_SECRET || undefined;
export const server__infuraProjectId = process.env.INFURA_PROJECT_ID || undefined;
export const server__infuraProjectSecret = process.env.INFURA_PROJECT_SECRET || undefined;
export const server__etherscanSecret = process.env.ETHERSCAN_SECRET || undefined;

export const prisma = new PrismaClient();
