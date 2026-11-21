// Petit utilitaire remplaçant `$fetch` de Nuxt :
// - sérialise automatiquement le `body` en JSON
// - parse la réponse JSON
// - lève une `ApiError` (avec `data` et `statusCode`) si le statut HTTP n'est pas 2xx

export class ApiError<T = any> extends Error {
  statusCode: number
  data: T

  constructor(statusCode: number, data: T) {
    super(`Erreur API (${statusCode})`)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, any> | null
}

export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, ...init } = options
  const headers = new Headers(init.headers)

  let requestBody: BodyInit | null | undefined = body as BodyInit | null | undefined
  const isPlainObject = body !== null && typeof body === 'object'
    && !(body instanceof FormData) && !(body instanceof Blob)
    && !(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer)

  if (isPlainObject) {
    requestBody = JSON.stringify(body)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...init, headers, body: requestBody })

  const text = await response.text()
  let data: any = text
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Réponse non JSON : on garde le texte brut
  }

  if (!response.ok) throw new ApiError(response.status, data)

  return data as T
}
