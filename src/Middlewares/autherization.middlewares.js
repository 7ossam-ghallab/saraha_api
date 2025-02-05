export const autherization = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { role  } = req.auth_user;
      const isRoleAllowed = allowedRoles.includes(role)
      
      console.log({
        allowedRoles,
        role,
        isRoleAllowed,
      })
      if (!isRoleAllowed) return res.status(403).json({ message: "Access denied" });
      next();
    } catch (err) {
      // console.error(err);
      res.status(500).json({ message : err.message });
    }
  }
}