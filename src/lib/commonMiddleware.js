import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";

export const commonMiddleware = (handler, customMiddlewares = []) => {
  const middyHandler = middy(handler);

  // Aplicar middlewares personalizados primero
  customMiddlewares.forEach((middleware) => {
    middyHandler.use(middleware);
  });

  // Aplicar middlewares comunes individualmente
  return middyHandler
    .use(httpEventNormalizer())
    .use(
      cors({
        origins: ["http://localhost:4321", "https://celigcr.com"],
      })
    )
    .use(
      httpErrorHandler({
        fallbackMessage: "An unexpected error occurred",
      })
    );
};
