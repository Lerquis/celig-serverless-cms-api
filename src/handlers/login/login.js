import { LoginSchema } from "../../lib/schemas/loginSchema.js";
import { transpileSchema } from "@middy/validator/transpile";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";

const login = async (event) => {
  const { email, password } = event.body;

  let auth0Res;
  let data;

  try {
    auth0Res = await fetch(
      "https://dev-kqwbo1bixpv2yz2m.us.auth0.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          username: email,
          password,
          grant_type: "password",
          scope: "openid",
        }),
      }
    );

    data = await auth0Res.json();
  } catch (networkError) {
    console.error("Network error during Auth0 request:", networkError);
    throw createHttpError.ServiceUnavailable(
      "Authentication service unavailable"
    );
  }

  // Manejar respuestas de Auth0
  if (auth0Res.status === 401 || auth0Res.status === 403) {
    throw createHttpError.Unauthorized("Invalid credentials");
  }

  if (auth0Res.status === 429) {
    throw createHttpError.TooManyRequests(
      "Too many login attempts. Please try again later"
    );
  }

  if (auth0Res.status >= 500) {
    throw createHttpError.ServiceUnavailable(
      "Authentication service temporarily unavailable"
    );
  }

  if (auth0Res.status !== 200) {
    console.error("Unexpected Auth0 response:", {
      status: auth0Res.status,
      data,
    });
    throw createHttpError.InternalServerError("Authentication failed");
  }

  // Login exitoso
  const { id_token, expires_in } = data;

  if (!id_token) {
    throw createHttpError.InternalServerError(
      "Invalid response from authentication service"
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      access_token: id_token,
      expires_in,
    }),
  };
};

export const handler = commonMiddleware(login, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(LoginSchema),
  }),
]);
