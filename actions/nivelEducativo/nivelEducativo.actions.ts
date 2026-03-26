'use server'

import { prisma } from '@/lib/prisma';

export async function getNiveles() {
  return await prisma.nivelEducativo.findMany({ orderBy: { nombre: 'asc' } });
};