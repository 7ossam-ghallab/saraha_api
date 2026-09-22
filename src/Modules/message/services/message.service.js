import { User } from "../../../DB/models/user.model.js";
import { Message } from "../../../DB/models/messages.model.js";
import { getErrorResponse } from "../../../utils/error-handling.utils.js";

export const sendMessage = async (req, res) => {
  try {
    const { body, ownerId } = req.body;
    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = await Message.create({ body, ownerId });
    return res
      .status(201)
      .json({ message: "Message sent successfully", newMessage });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

// Admin-only (route is protected). Returns all messages with owner info.
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate([
      { path: "ownerId", select: "-password -otp -__v" },
    ]);
    return res
      .status(200)
      .json({ message: "Messages retrieved successfully", messages });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { _id } = req.auth_user;
    const messages = await Message.find({ ownerId: _id });
    return res
      .status(200)
      .json({ message: "Messages retrieved successfully", messages });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};