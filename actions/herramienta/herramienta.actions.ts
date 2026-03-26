'use server'
import { prisma } from '@/lib/prisma';

export async function getHerramientas() {
  return await prisma.herramienta.findMany({ orderBy: { nombre: 'asc' } });
}
