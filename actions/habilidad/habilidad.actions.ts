'use server'
import { prisma } from '@/lib/prisma';

export async function getHabilidadesByConvenio({ idTipoConvenio }: { idTipoConvenio: number }) {
  return await prisma.habilidad.findMany({
    where: { idTipoConvenio },
    orderBy: { nombre: 'asc' },
  });
}
