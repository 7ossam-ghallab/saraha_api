import { getErrorResponse } from "../utils/error-handling.utils.js";

export const autherization = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { role } = req.auth_user;
      const isRoleAllowed = allowedRoles.includes(role);
      if (!isRoleAllowed) return res.status(403).json({ message: "Access denied" });
      next();
    } catch (err) {
      const { status, message } = getErrorResponse(err);
      return res.status(status).json({ message });
    }
  };
};