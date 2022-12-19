import nookies from 'nookies';
import { HttpClient } from '../../src/infra/HttpClient/HttpClient';
import tokenService from '../../src/services/auth/tokenService';

const REFRESH_TOKEN_NAME = 'REFRESH_TOKEN'

const controllers = {
  async storeRefreshToken(request, response) {
    const context = { request, response }

    nookies.set(context, REFRESH_TOKEN_NAME, request.body.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    const test = nookies.get(context)

    console.log(test[REFRESH_TOKEN_NAME])

    response.json({
      data: {
        message: 'Stored with success'
      }
    })
  },
  async regenerateToken(request, response) {
    const context = { request, response };
    const cookies = nookies.get(context);
    const refresh_token = cookies[REFRESH_TOKEN_NAME] || request.body.refresh_token;

    const refreshResponse = await HttpClient(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/refresh`, {
      method: 'POST',
      body: { refresh_token }
    });

    if (!refreshResponse.ok) {
      response.status(401).json({
        status: 401,
        message: 'Not Authorized',
      })

      return;
    }

    nookies.set(context, REFRESH_TOKEN_NAME, refreshResponse.body.data.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    tokenService.save(context, refreshResponse.body.data.refresh_token);

    response.status(200).json({
      data: refreshResponse.body.data
    });
  },
  async delete(request, response) {
    const context = { request, response };

    nookies.destroy(context, REFRESH_TOKEN_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    response.status(200).json({
      data: {
        status: 200,
        message: 'Deleted with success',
      }
    });
  }
}

const controllerBy = {
  POST: controllers.storeRefreshToken,
  GET: controllers.regenerateToken,
  PUT: controllers.regenerateToken,
  DELETE: controllers.delete,
}

export default function handler(request, response) {
  if (controllerBy[request.method]) {
    return controllerBy[request.method](request, response)
  }

  response.status(404).json({
    status: 404,
    message: 'Not Found'
  })
}
