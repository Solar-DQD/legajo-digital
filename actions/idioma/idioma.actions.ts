'use server'
import { prisma } from '@/lib/prisma';

export async function getIdiomas() {
  return await prisma.idioma.findMany({ orderBy: { nombre: 'asc' } });
}
