import { PrismaClient } from '@prisma/client';

/** Postgres database client to interact with database */
const prisma = new PrismaClient();

export default prisma;
