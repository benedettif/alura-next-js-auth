import { tokenService } from "../../services/auth/tokenService";
import nookies from 'nookies';

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
    }).then(async (response) => {
      if (!options.refresh || resposne.status !== 401) {
        return response;
      }

      const isServer = Boolean(options?.context);
      const currentRefreshToken = options?.context?.request?.cookies['REFRESH_TOKEN_NAME'];

      try {
        const refreshResponse = await HttpClient('/api/refresh', {
          method: isServer ? 'PUT' : 'GET',
          body: isServer ? { refresh_token: currentRefreshToken } : undefined,
        });
        const newAccessToken = refreshResponse.body.data.access_token;
        const newRefreshToken = refreshResponse.body.data.refresh_token;
  
        if (isServer) {
              nookies.set(options.context, 'REFRESH_TOKEN_NAME', newRefreshToken, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
              })
        }
  
        tokenService.save(newAccessToken);
  
        const retryResponse = await HttpClient(fetchUrl, {
          ...options,
          refresh: false,
          headers: {
            'Authorization': `Bearer ${newAccessToken}`
          }
        });
  
        return retryResponse;
      } catch(error) {
        console.error(error);
        return response;
      }
    });
}