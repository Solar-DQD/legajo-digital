'use server'
import { prisma } from '@/lib/prisma';

export async function getDisponibilidades() {
  return await prisma.disponibilidadViaje.findMany({ orderBy: { nombre: 'asc' } });
}
