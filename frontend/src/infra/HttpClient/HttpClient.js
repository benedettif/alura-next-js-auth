export async function HttpClient(url, options) {
  return fetch(url, {
      ...options,
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : null,
    })
    .then(async(response) => {
      return {
        ok: response.ok,
        body: await response.json()
      }
    })
}