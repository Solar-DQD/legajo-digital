'use server'

import { prisma } from '@/lib/prisma';

let estadosCache: Record<string, number> | null = null;

export async function getEstadosEmpleado() {
  if (estadosCache) return estadosCache;
  const estados = await prisma.estadoEmpleado.findMany();
  estadosCache = Object.fromEntries(estados.map(e => [e.nombre, e.id]));
  return estadosCache;
};
