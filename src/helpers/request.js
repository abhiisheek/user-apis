export const getRequestHeaders = (req) => {
  const authorization = req.get("Authorization");
  const apiKey = req.get("X-API-KEY");

  const headers = {};

  if (authorization) {
    headers["Authorization"] = authorization;
  } else if (apiKey) {
    headers["X-API-KEY"] = apiKey;
  }

  return headers;
};
