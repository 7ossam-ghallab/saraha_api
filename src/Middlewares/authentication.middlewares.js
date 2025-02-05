import BlackListTokens from "../DB/models/black-list-tokens.model.js";
import { User } from "../DB/models/user.model.js";
import jwt from "jsonwebtoken"

export const authenticationMiddleware = () => {

  return async (req, res, next) => {

    try {
      const { access_token } = req.headers;
      if (!access_token) return res.status(401).json({ message: "No access token provided" });
      const decodedData = jwt.verify(access_token, process.env.JWT_SECRET_ACCESS);
      const blackListedToken = await BlackListTokens.findOne({ tokenId: decodedData.jti });
      if (blackListedToken) return res.status(401).json({ message: "Token is blacklisted" });
      const user = await User.findById(decodedData._id, '-password -__v').lean();
      if (!user) return res.status(404).json({ message: "User not found" });
      req.auth_user = {...user, token : {tokenId : decodedData.jti, expiresAt : decodedData.exp}};
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}