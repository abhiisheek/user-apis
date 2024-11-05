import logger from "../utils/logger.js";

export const errorHandler = (response, error, responseStatusCode = 500) => {
  logger.error("Error occured", error);

  response.status(responseStatusCode).send(error);
};
