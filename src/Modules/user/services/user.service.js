import { User } from "../../../DB/models/user.model.js";
import { Decryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken"

export const profileData = async (req, res) => {
  try {
    const { accessToken } = req.headers;
    const decodedData = jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS)
    console.log(decodedData)
    const user = await User.findById(decodedData._id)
    if (!user) return res.status(404).json({ message: "User not found" });
    user.phone = await Decryption({cipher: user.phone, key: process.env.ENCRYPTED_KEY})
    return res.status(200).json({ message: "user founded successfully" , user});
  } catch (err) {
    res.status(500).json(err);
  }
}