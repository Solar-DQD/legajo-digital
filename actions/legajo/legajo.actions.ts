'use server'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { FormPayload } from '@/lib/types/legajo'
import { MAX_CV_SIZE, MAX_CV_TOTAL_SIZE } from '@/lib/constants'
import { parseMonthYear } from '@/lib/utils/parseMonthYear'
import { verifyTurnstile } from '@/actions/turnstile/turnstile.actions'
import { getGraphToken, uploadFilesToSharePoint } from '@/actions/graphApi/graphApi.actions'
import { getEstadosEmpleado } from '../estadoEmpleado/estadoEmpleado.actions'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export async function submitLegajo(formData: FormData, isPostulante: boolean): Promise<{ error?: string }> {
  const data = JSON.parse(formData.get('data') as string) as FormPayload
  const tag = `[submitLegajo ${data.dni}]`
  console.time(`${tag} total`)
  try {
    const archivos = formData.getAll('archivos') as File[]
    const turnstileToken = formData.get('turnstileToken') as string

    // Verificar Turnstile
    console.time(`${tag} verifyTurnstile`)
    const turnstileOk = turnstileToken && (await verifyTurnstile(turnstileToken))
    console.timeEnd(`${tag} verifyTurnstile`)
    if (!turnstileOk) {
      return { error: 'Verificación de seguridad fallida. Por favor recargá la página e intentá de nuevo.' }
    }

    // Validación server-side de archivos
    if (!archivos.length || archivos[0].size === 0) return { error: 'CV requerido' }
    let totalSize = 0
    for (const archivo of archivos) {
      if (archivo.type !== 'application/pdf') return { error: `"${archivo.name}" debe ser un archivo PDF` }
      if (archivo.size > MAX_CV_SIZE) return { error: `"${archivo.name}" no puede superar los 5 MB` }
      totalSize += archivo.size
    }
    if (totalSize > MAX_CV_TOTAL_SIZE) return { error: `El tamaño total de los archivos no puede superar los ${MAX_CV_TOTAL_SIZE / 1024 / 1024} MB` }
    console.log(`${tag} ${archivos.length} archivo(s), ${(totalSize / 1024).toFixed(1)} KB total`)

    // Validar fecha de nacimiento
    if (!data.fechaNacimiento) return { error: 'La fecha de nacimiento es requerida' }
    const fechaNac = dayjs(data.fechaNacimiento, 'DD-MM-YYYY')
    if (!fechaNac.isValid()) return { error: 'La fecha de nacimiento tiene un formato inválido' }

    // Subir archivos a SharePoint (fuera de la transacción de DB)
    console.time(`${tag} getGraphToken`)
    const token = await getGraphToken();
    console.timeEnd(`${tag} getGraphToken`)

    console.time(`${tag} uploadFilesToSharePoint`)
    const urlCv = await uploadFilesToSharePoint(archivos, token, isPostulante, data.pais, data.provincia, data.dni);
    console.timeEnd(`${tag} uploadFilesToSharePoint`)

    console.time(`${tag} getEstadosEmpleado`)
    const estados = await getEstadosEmpleado();
    console.timeEnd(`${tag} getEstadosEmpleado`)

    // Todo lo de DB dentro de una transacción
    console.time(`${tag} db transaction`)
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Crear habilidades y herramientas personalizadas
      const customHabilidades = await Promise.all(
        data.habilidadesPersonalizadas.map(nombre =>
          tx.habilidad.create({ data: { nombre, idTipoConvenio: data.convenio } })
        )
      )
      const customHerramientas = await Promise.all(
        data.herramientasPersonalizadas.map(nombre =>
          tx.herramienta.create({ data: { nombre } })
        )
      )

      // Crear empleado
      const empleado = await tx.empleado.create({
        data: {
          nombre: data.nombre,
          dni: data.dni,
          telefono: data.telefono,
          email: data.email,
          urlCv,
          fechaNacimiento: dayjs(data.fechaNacimiento, 'DD-MM-YYYY').toDate(),
          idProvincia: data.provincia,
          idPais: data.pais,
          idTipoConvenio: data.convenio,
          idDisponibilidadViaje: data.disponibilidad,
          idArea: data.area === '' ? null : data.area,
          puesto: data.puesto || null,
          idPuesto: data.puestoId === '' ? null : data.puestoId,
          idEstadoEmpleado: isPostulante ? estados['Postulante'] : estados['Empleado Activo'],
        },
      })

      const allHabilidadIds = [...data.habilidades, ...customHabilidades.map(h => h.id)]
      const allHerramientaIds = [...data.herramientas, ...customHerramientas.map(h => h.id)]

      // Crear todas las relaciones
      await Promise.all([
        ...data.experiencias.map(e => {
          const desde = parseMonthYear(e.desde)
          const hasta = parseMonthYear(e.hasta)
          if (!desde) throw new Error(`Fecha "desde" inválida en experiencia: ${e.empresa}`)
          return tx.empleadoExperiencia.create({
            data: {
              empresa: e.empresa,
              puesto: e.puesto,
              rubro: e.sector,
              desde: new Date(desde.year, desde.month - 1, 1),
              hasta: hasta ? new Date(hasta.year, hasta.month - 1, 1) : null,
              descripcion: e.descripcion,
              idEmpleado: empleado.id,
            },
          })
        }),
        ...data.educaciones.map(e => {
          const desde = parseMonthYear(e.desde)
          const hasta = parseMonthYear(e.hasta)
          if (!desde) throw new Error(`Fecha "inicio" inválida en educación: ${e.titulo}`)
          return tx.empleadoEducacion.create({
            data: {
              titulo: e.titulo,
              institucion: e.institucion,
              inicio: desde.year,
              final: hasta?.year ?? null,
              idNivelEducativo: e.nivel,
              idEmpleado: empleado.id,
            },
          })
        }),
        ...data.certificaciones.map(nombre =>
          tx.empleadoCertificacion.create({ data: { nombre, idEmpleado: empleado.id } })
        ),
        ...data.idiomas.map(idIdioma =>
          tx.empleadoIdioma.create({ data: { idEmpleado: empleado.id, idIdioma } })
        ),
        ...allHabilidadIds.map(idHabilidad =>
          tx.empleadoHabilidad.create({ data: { idEmpleado: empleado.id, idHabilidad } })
        ),
        ...allHerramientaIds.map(idHerramienta =>
          tx.empleadoHerramienta.create({ data: { idEmpleado: empleado.id, idHerramienta } })
        ),
        ...data.licencias.map(idLicencia =>
          tx.empleadoLicencia.create({ data: { idEmpleado: empleado.id, idLicencia } })
        ),
      ])
    })
    console.timeEnd(`${tag} db transaction`)

    return {}
  } catch (error) {
    console.error(tag, error)
    return { error: error instanceof Error ? error.message : 'Error al guardar el legajo' }
  } finally {
    console.timeEnd(`${tag} total`)
  }
}

