import { getErrorResponse } from "../utils/error-handling.utils.js";

export const errorHandler = (api) => {
  return (req, res, next) => {
    Promise.resolve(api(req, res, next)).catch((err) => {
      if (err) {
        console.error(`ERROR IN :${req.originalUrl}`, err.message);
        return next(Object.assign(err, { status: getErrorResponse(err).status }));
      }
      return next();
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  const { status, message } = getErrorResponse(err);
  if (status >= 500) {
    console.error(`[global error handler] ${req.originalUrl}`, err);
  } else {
    console.warn(`[global error handler] ${req.originalUrl} -> ${status}`, err.message);
  }
  return res.status(status).json({ message });
};