'use server'

import { getPaisNombre } from "../pais/pais.actions"
import { getProvinciaNombre } from "../provincia/provincia.actions"

export async function getGraphToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  )
  const json = await res.json()
  if (!json.access_token) throw new Error('No se pudo obtener el token de SharePoint')
  return json.access_token
}

export async function uploadFilesToSharePoint(files: File[], token: string, isPostulante: boolean, paisId: number, provinciaId: number, dni: string): Promise<string> {
  const tag = `[sharepoint ${dni}]`
  const siteName = process.env.SP_SITE_NAME!
  const libraryName = process.env.SP_LIBRARY_NAME!
  const uploadPathEmployee = process.env.SP_UPLOAD_PATH_EMPLOYEE!
  const uploadPathAplicant = process.env.SP_UPLOAD_PATH_APLICANT!

  const uploadPath = isPostulante ? uploadPathAplicant : uploadPathEmployee;

  console.time(`${tag} pais+provincia lookup`)
  const pais = await getPaisNombre(paisId);
  const provincia = await getProvinciaNombre(provinciaId);
  console.timeEnd(`${tag} pais+provincia lookup`)

  console.time(`${tag} sites search`)
  const sitesRes = await fetch(`https://graph.microsoft.com/v1.0/sites?search=${siteName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const sitesJson = await sitesRes.json()
  console.timeEnd(`${tag} sites search`)
  if (!sitesJson.value?.length) throw new Error(`Sitio "${siteName}" no encontrado en SharePoint`)
  const siteId: string = sitesJson.value[0].id

  console.time(`${tag} drives lookup`)
  const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const drivesJson = await drivesRes.json()
  console.timeEnd(`${tag} drives lookup`)
  const drive = drivesJson.value?.find((d: { name: string }) => d.name === libraryName)
  if (!drive) throw new Error(`Biblioteca "${libraryName}" no encontrada en "${siteName}"`)

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const baseName = `${dni}-${dateStr}`
  const basePath = `${uploadPath}/${pais!.nombre}/${provincia!.nombre}`

  if (files.length === 1) {
    // Un solo archivo: sube suelto como antes
    console.time(`${tag} PUT single file`)
    const buffer = await files[0].arrayBuffer()
    const uploadRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${basePath}/${baseName}.pdf:/content`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
        body: buffer,
      }
    )
    console.timeEnd(`${tag} PUT single file`)
    if (!uploadRes.ok) throw new Error('Error al subir el archivo a SharePoint')
    const uploadJson = await uploadRes.json()
    return uploadJson.webUrl as string
  }

  // Múltiples archivos: crea carpeta y sube adentro
  console.time(`${tag} create folder`)
  const folderRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${basePath}:/children`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: baseName, folder: {}, '@microsoft.graph.conflictBehavior': 'rename' }),
    }
  )
  console.timeEnd(`${tag} create folder`)
  if (!folderRes.ok) throw new Error('Error al crear la carpeta en SharePoint')
  const folderJson = await folderRes.json()
  const folderUrl: string = folderJson.webUrl

  console.time(`${tag} PUT ${files.length} files`)
  await Promise.all(
    files.map(async (file, index) => {
      const safeName = `${index + 1}_${file.name.replace(/[/\\]/g, '_')}`
      const buffer = await file.arrayBuffer()
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${basePath}/${baseName}/${safeName}:/content`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
          body: buffer,
        }
      )
      if (!res.ok) throw new Error(`Error al subir "${file.name}" a SharePoint`)
    })
  )
  console.timeEnd(`${tag} PUT ${files.length} files`)

  return folderUrl
}