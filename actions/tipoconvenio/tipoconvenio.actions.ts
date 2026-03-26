'use server'

import { prisma } from '@/lib/prisma';

export async function getTiposConvenio() {
  const convenios = await prisma.tipoConvenio.findMany({ orderBy: { nombre: 'asc' } });
  const fueraConvenio = await getTipoConvenioFueraConvenio();
  return {
    convenios,
    fueraConvenio
  };
};

export async function getTipoConvenioFueraConvenio() {
    return await prisma.tipoConvenio.findFirst({ where: { nombre: 'Fuera de Convenio' } });
};