/**
 * destructuring data from request body
 * check if email is already exists in db or not
 * Hash password
 * Encrypt phone number
 * if not exists then create new user
 * send email for verfication
 */

import { User } from "../../../DB/models/user.model.js";
import { compare, compareSync, hash, hashSync } from "bcrypt";
import { Encryption } from "../../../utils/encryption.utils.js";
import { sendEmailService } from "../../../Services/send-email.services.js";
import { emitter } from "../../../Services/send-email.services.js";
import path from "path";
import jwt from "jsonwebtoken"

/**
 * find
 * findOne
 * findById == findByPK
 */

/**
 * create
 * save
 * insertMany
 */

export const signUp = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const isEmailExist = await User.findOne({ email });

    if (isEmailExist)
      return res.status(409).json({ message: "Email already exists" });

    // const user = await User.create({
    //   userName: username,
    //   password: password,
    //   phone,
    //   email,
    // });

    const hashPassword = hashSync(password, +process.env.SALT);
    // const hashPassword = await hash(password, 10);

    const encryptedPhone = await Encryption({
      value: phone,
      key: process.env.ENCRYPTED_KEY,
    });

    // const isEmailSent = await sendEmailService({
    //   to: email,
    //   subject: "Email Verification",
    //   html: "<h1> verify your email </h1>",
    //   // attachments: [
    //   //   {
    //   //     filename: "mysql-tutorial-excerpt-5.7-en.pdf",
    //   //     path: path.resolve("Assets/mysql-tutorial-excerpt-5.7-en.pdf"),
    //   //   },
    //   //   {
    //   //     filename: "image.png",
    //   //     path: path.resolve("Assets/image.png"),
    //   //   },
    //   // ],
    // });
    // console.log(isEmailSent)

    const token = jwt.sign({email}, process.env.JWT_SECRET_KEY, {expiresIn : 60});

    const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify-email/${token}`

    emitter.emit("sendMail", {
      to: email,
      subject: "Email Verification",
      html: 
      `
        <h1> verify your email </h1>
        <p>Click on the following link to verify your email:</p>
        <a href="${confirmEmailLink}">confirm Email</a>
      `,
      attachments: [
        {
          filename: "mysql-tutorial-excerpt-5.7-en.pdf",
          path: path.resolve("Assets/mysql-tutorial-excerpt-5.7-en.pdf"),
        },
        {
          filename: "image.png",
          path: path.resolve("Assets/image.png"),
        },
      ],
    })

    const newUser = new User({
      userName: username,
      password: hashPassword,
      phone: encryptedPhone,
      email,
    });
    const user = await newUser.save();

    if (!user)
      return res.status(500).json({ message: "create user failed, try again" });

    return res.status(201).json({ message: "user created successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

/*
{
  "username" : "hossam_ghallab",
  "password" : "123456789",
  "confirmPassword" : "123456789",
  "email" : "7ossam.ghallab@gmail.com",
  "phone" : "+201111111111"
}
*/

/**
 * two way encryption (encryption ✔ | decryption ✔) >>>> crypto-js
 *** Symmetrice    >> one key
 ****** hossam => encryption => 'secret_1' => cipher
 ****** cipher => decryption => 'secret_1' => hossam

 *** ASymmetrice   >> two keys
 * one way encryption (encryption ✔ | decryption ✖) >> don't create decryption after encrypted it >>>> bcrypt
 *** Hash
*/

/**
 * plain text               =>> Hossma
 * cipher                   =>> dlakfjownvdsakfl423
 * signature (secret key)   =>> wayToCreateEncryption
 */




/**
 * updateOne
 * updateMany
 * 
 * findOneAndUpdate
 * findByIdAndUpdate
 * save
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOneAndUpdate(
      { email : decodedData.email },
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({message : "Email verfied successfully", user})
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
}


export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "invalid email or password" });
    const isPasswordMatch = compareSync(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "invalid email or password" });
    const accessToken = jwt.sign({_id:user._id, email:user.email}, process.env.JWT_SECRET_ACCESS)
    return res
      .status(201)
      .json({ message: "user logged in successfully", token : accessToken ,  user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err, message: err.message });
  }
};

/*
{
  "email": "7ossam.ghallab@gmail.com",
  "password" : "123456789"
}
*/
