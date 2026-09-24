import crypto from "crypto";
import { User } from "../../../DB/models/user.model.js";
import { compareSync, hashSync } from "bcrypt";
import { Encryption } from "../../../utils/encryption.utils.js";
import { emitter } from "../../../Services/send-email.services.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListTokens from "../../../DB/models/black-list-tokens.model.js";
import { sanitizeUser } from "../../../utils/sanitizers.utils.js";
import { getErrorResponse } from "../../../utils/error-handling.utils.js";

const EMAIL_VERIFY_EXPIRY = "30m";
const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Builds the base URL used in e-mail links.
 * Uses APP_URL env when available (prevents Host-header injection),
 * falls back to the request's protocol + host for local development.
 */
const getAppURL = (req) =>
  process.env.APP_URL || `${req.protocol}://${req.headers.host}`;

const buildVerificationEmail = (link) => ({
  subject: "Email Verification",
  html: `
    <h1> Verify your email </h1>
    <p>Click on the following link to verify your email:</p>
    <a href="${link}">Confirm Email</a>
  `,
});

export const signUp = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const isEmailExist = await User.findOne({ email });

    if (isEmailExist)
      return res.status(409).json({ message: "Email already exists" });

    const hashPassword = hashSync(password, +process.env.SALT);

    const encryptedPhone = await Encryption({
      value: phone,
      key: process.env.ENCRYPTED_KEY,
    });

    const newUser = new User({
      userName: username,
      password: hashPassword,
      phone: encryptedPhone,
      email,
    });
    const user = await newUser.save();

    if (!user)
      return res.status(500).json({ message: "create user failed, try again" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: EMAIL_VERIFY_EXPIRY,
      jwtid: uuidv4(),
    });

    const confirmEmailLink = `${getAppURL(req)}/auth/verify-email/${token}`;

    emitter.emit("sendMail", {
      to: email,
      ...buildVerificationEmail(confirmEmailLink),
    });

    return res
      .status(201)
      .json({ message: "user created successfully", user: sanitizeUser(user) });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOneAndUpdate(
      { email: decodedData.email },
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "Email verfied successfully", user: sanitizeUser(user) });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.isDeleted)
      return res.status(401).json({ message: "invalid email or password" });
    if (!user.isEmailVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email before signing in" });

    const isPasswordMatch = compareSync(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "invalid email or password" });
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_ACCESS,
      { expiresIn: "1h", jwtid: uuidv4() }
    );
    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: "5d", jwtid: uuidv4() }
    );
    return res.status(200).json({
      message: "user logged in successfully",
      token: accessToken,
      refresh_token: refreshToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.headers;
    if (!refresh_token)
      return res.status(401).json({ message: "No refresh token provided" });

    const decodedData = jwt.verify(
      refresh_token,
      process.env.JWT_SECRET_REFRESH
    );

    if (decodedData.exp * 1000 < Date.now())
      return res.status(401).json({ message: "Token expired" });

    const blackListedToken = await BlackListTokens.findOne({
      tokenId: decodedData.jti,
    });
    if (blackListedToken)
      return res.status(401).json({ message: "Token is blacklisted" });

    const accessToken = jwt.sign(
      { _id: decodedData._id, email: decodedData.email },
      process.env.JWT_SECRET_ACCESS,
      { expiresIn: "1h", jwtid: uuidv4() }
    );
    return res.json({
      message: "Token refreshed successfully",
      token: accessToken,
    });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const logOut = async (req, res) => {
  try {
    const { access_token, refresh_token } = req.headers;
    if (!access_token || !refresh_token)
      return res
        .status(401)
        .json({ message: "Logout requires access_token and refresh_token" });

    const decodedAccessToken = jwt.verify(
      access_token,
      process.env.JWT_SECRET_ACCESS
    );
    const decodedRefreshToken = jwt.verify(
      refresh_token,
      process.env.JWT_SECRET_REFRESH
    );

    // Idempotent blacklist using upserts (tolerates already-blacklisted tokens).
    await BlackListTokens.bulkWrite([
      {
        updateOne: {
          filter: { tokenId: decodedAccessToken.jti },
          update: {
            $setOnInsert: {
              tokenId: decodedAccessToken.jti,
              expiryDate: new Date(decodedAccessToken.exp * 1000),
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { tokenId: decodedRefreshToken.jti },
          update: {
            $setOnInsert: {
              tokenId: decodedRefreshToken.jti,
              expiryDate: new Date(decodedRefreshToken.exp * 1000),
            },
          },
          upsert: true,
        },
      },
    ]);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const OTP = crypto.randomInt(100000, 999999);

    emitter.emit("sendMail", {
      to: user.email,
      subject: "Reset Password",
      html: `
        <h1>Reset Password</h1>
        <h2>OTP : <span style="color: #158">${OTP}</span></h2>
      `,
    });

    const hashOTP = hashSync(OTP.toString(), +process.env.SALT);

    await User.updateOne(
      { email: user.email },
      {
        $set: {
          otp: hashOTP,
          otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
          otpAttempts: 0,
        },
      }
    );
    return res
      .status(200)
      .json({ message: "Reset password email sent successfully" });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid OTP" });

    if (!user.otp || !user.otpExpiresAt)
      return res.status(401).json({ message: "Invalid OTP" });
    if (user.otpExpiresAt < new Date())
      return res
        .status(401)
        .json({ message: "OTP has expired, please request a new one" });
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS)
      return res
        .status(429)
        .json({ message: "Too many incorrect attempts, request a new OTP" });

    const isOTPMatch = compareSync(otp.toString(), user.otp);
    if (!isOTPMatch) {
      await User.updateOne(
        { email: user.email },
        { $inc: { otpAttempts: 1 } }
      );
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const hashPassword = hashSync(password, +process.env.SALT);
    await User.updateOne(
      { email: user.email },
      {
        $set: { password: hashPassword, otpAttempts: 0 },
        $unset: { otp: "", otpExpiresAt: "" },
      }
    );
    res.status(200).json({ message: "password updated successfully" });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};