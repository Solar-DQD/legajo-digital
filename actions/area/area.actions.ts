'use server'

import { prisma } from '@/lib/prisma';

export async function getAreas() {
  return await prisma.area.findMany({ orderBy: { nombre: 'asc' } });
};