import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";

export const commonMiddleware = (handler, customMiddlewares = []) =>
  middy(handler)
    .use([...customMiddlewares]) // se aplican primero
    .use([httpEventNormalizer(), httpErrorHandler(), cors()]);
