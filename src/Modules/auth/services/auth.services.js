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

    const encryptedPhone = await Encryption({value : phone, key : process.env.ENCRYPTED_KEY})
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
  "username" : "hossamghallab",
  "password" : "123456789",
  "confirmPassword" : "123456789",
  "email" : "7os.gh@gmail.com",
  "phone" : "010123456789"
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

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "invalid email or password" });
    const isPasswordMatch = compareSync(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "invalid email or password" });

    return res
      .status(201)
      .json({ message: "user logged in successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err, message: err.message });
  }
};

/*
{
  "email": "7ossam.gh@gmail.com",
  "password" : "123456789"
}
*/