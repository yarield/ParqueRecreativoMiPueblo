/**
 * Dispara la descarga de un blob en el navegador. Se usa un enlace temporal
 * porque la petición lleva el token en la cabecera y no se puede resolver con
 * un `<a href>` normal apuntando al API.
 */
export function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Liberar el objeto: si no, el blob queda en memoria hasta recargar la página.
  URL.revokeObjectURL(url)
}
