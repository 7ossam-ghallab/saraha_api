import { User } from "../../../DB/models/user.model.js";
import { Decryption } from "../../../utils/encryption.utils.js";

export const profileData = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findOne({_id})
    if (!user) return res.status(404).json({ message: "User not found" });
    user.phone = await Decryption({cipher: user.phone, key: process.env.ENCRYPTED_KEY})
    return res.status(200).json({ message: "user founded successfully" , user});
  } catch (err) {
    res.status(500).json({ message: err.message});
  }
}