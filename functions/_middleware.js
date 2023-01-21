// https://developers.cloudflare.com/pages/platform/functions/examples/cors-headers/
export const onRequest = async ({ next }) => {
  const response = await next();
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
};
