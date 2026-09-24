/**
 * Removes sensitive fields (password, otp) and Mongo internals (`__v`)
 * from any user object before it is returned to the client.
 * Accepts either a Mongoose document or a plain (lean) object.
 */
export const sanitizeUser = (user) => {
  if (!user) return user;

  const doc = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, otp, otpExpiresAt, otpAttempts, __v, ...safeUser } = doc;
  return safeUser;
};