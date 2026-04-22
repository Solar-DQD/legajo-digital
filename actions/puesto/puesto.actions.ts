'use server'

import { prisma } from '@/lib/prisma';

export async function getPuestos() {
  return await prisma.puesto.findMany({ orderBy: { nombre: 'asc' } });
};