import { User } from "../../../DB/models/user.model.js";
import BlackListTokens  from "../../../DB/models/black-list-tokens.model.js";
import { Decryption, Encryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken"
import { compareSync, hashSync } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { emitter } from "../../../Services/send-email.services.js";
// import asyncHandler from "express-async-handler";

// export const profileData = asyncHandler(
//   async (req, res) => {
//     try {
//       const user = req.auth_user
//       user.phone = await Decryption({cipher: user.phone, key: process.env.ENCRYPTED_KEY})
//       return res.status(200).json({ message: "user founded successfully" , user});
//     } catch (err) {
//       console.log(err);
//       res.status(500).json(err);  
//     }
//   }
// )
export const profileData = async (req, res) => {
  try {
    const user = req.auth_user
    user.phone = await Decryption({cipher: user.phone, key: process.env.ENCRYPTED_KEY})
    return res.status(200).json({ message: "user founded successfully" , user});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);  
  }
}

export const updatePassword = async (req, res) => {
  try {
    const {_id} = req.auth_user
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (newPassword!== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    const hashedPassword = hashSync(newPassword, +process.env.SALT)
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}



export const updateProfile = async (req, res) => {
  try {
    const { _id } = req.auth_user
    const { userName, email, phone } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userName) user.userName = userName
    if (phone) {
      user.phone = await Encryption({value : phone, key : process.env.ENCRYPTED_KEY})
    }
    if (email) {
      const isEmailExist = await User.findOne({ email });
      if (isEmailExist)
        return res.status(409).json({ message: "Email already exists" });
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {expiresIn: "15m" , jwtid: uuidv4()});
      
      const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify-email/${token}`;
      
      emitter.emit("sendMail", {
        to: email,
        subject: "Email Verification",
        html: `
          <h1> verify your email </h1>
          <p>Click on the following link to verify your email:</p>
          <a href="${confirmEmailLink}">confirm Email</a>
        `,
      });
      user.email = email
      user.isEmailVerified = false;
    }
    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
    
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ message: "Users listed successfully", users });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}