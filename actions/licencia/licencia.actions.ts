'use server'

import { prisma } from '@/lib/prisma';

export async function getLicencias() {
  return await prisma.licencia.findMany({ orderBy: { nombre: 'asc' } });
};