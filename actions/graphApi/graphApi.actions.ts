'use server'

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

export async function uploadCvToSharePoint(file: File, token: string): Promise<string> {
  const siteName = process.env.SP_SITE_NAME!
  const libraryName = process.env.SP_LIBRARY_NAME!
  const uploadPath = process.env.SP_UPLOAD_PATH!

  const sitesRes = await fetch(`https://graph.microsoft.com/v1.0/sites?search=${siteName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const sitesJson = await sitesRes.json()
  if (!sitesJson.value?.length) throw new Error(`Sitio "${siteName}" no encontrado en SharePoint`)
  const siteId: string = sitesJson.value[0].id

  const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const drivesJson = await drivesRes.json()
  const drive = drivesJson.value?.find((d: { name: string }) => d.name === libraryName)
  if (!drive) throw new Error(`Biblioteca "${libraryName}" no encontrada en "${siteName}"`)

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${Date.now()}_${safeName}`
  const buffer = await file.arrayBuffer()

  const uploadRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${drive.id}/root:/${uploadPath}/${filename}:/content`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
      body: buffer,
    }
  )
  if (!uploadRes.ok) throw new Error('Error al subir el CV a SharePoint')
  const uploadJson = await uploadRes.json()
  return uploadJson.webUrl as string
}