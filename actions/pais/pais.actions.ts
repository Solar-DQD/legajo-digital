'use server'

import { prisma } from '@/lib/prisma';

export async function getPaises() {
  return await prisma.pais.findMany({ orderBy: { nombre: 'asc' } });
};