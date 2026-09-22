/**
 * Centralized error mapping.
 * Converts thrown errors / mongoose errors / JWT errors into a safe
 * { status, message } pair so that internal details never leak to clients.
 */

export const getErrorResponse = (err) => {
  let status = 500;
  let message = "Internal Server Error";

  if (!err) return { status, message };

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
  } else if (err.code === 11000) {
    status = 409;
    message = "Duplicate value error";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.status && err.status < 500) {
    // Explicit 4xx errors (e.g. body-parser JSON syntax errors) keep their message.
    status = err.status;
    message = err.message;
  } else if (err.expose && err.message) {
    // Errors deliberately marked as safe to expose (e.g. boom-style errors)
    status = err.status || 500;
    message = err.message;
  }

  return { status, message };
};