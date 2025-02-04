import { User } from "../../../DB/models/user.model.js";
import BlackListTokens  from "../../../DB/models/black-list-tokens.model.js";
import { Decryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken"

export const profileData = async (req, res) => {
  try {
    const { access_token } = req.headers;
    const decodedData = jwt.verify(access_token, process.env.JWT_SECRET_ACCESS)
    // console.log(decodedData)
    const isTokenBalckListed = await BlackListTokens.findOne({tokenId : decodedData.jti})
    if(isTokenBalckListed) return res.status(401).json({ message: "Token is blacklisted" });
    const user = await User.findById(decodedData._id)
    if (!user) return res.status(404).json({ message: "User not found" });
    user.phone = await Decryption({cipher: user.phone, key: process.env.ENCRYPTED_KEY})
    return res.status(200).json({ message: "user founded successfully" , user});
  } catch (err) {
    res.status(500).json(err);
  }
}