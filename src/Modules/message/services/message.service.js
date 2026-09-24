import mongoose from "mongoose";
import { User } from "../../../DB/models/user.model.js";
import { Message } from "../../../DB/models/messages.model.js";
import { getErrorResponse } from "../../../utils/error-handling.utils.js";
import { systemRoles } from "../../../Constants/systemRoles.constants.js";

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

export const sendMessage = async (req, res) => {
  try {
    const { body, ownerId } = req.body;
    if (!mongoose.isValidObjectId(ownerId)) {
      return res.status(400).json({ message: "Invalid ownerId format" });
    }
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

// Admin-only (route is protected). Returns all messages with owner info, paginated.
export const getMessages = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [messages, total] = await Promise.all([
      Message.find()
        .populate([
          { path: "ownerId", select: "-password -otp -__v" },
        ])
        .skip(skip)
        .limit(limit),
      Message.countDocuments(),
    ]);
    return res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

// Returns only the caller's messages, paginated.
export const getUserMessages = async (req, res) => {
  try {
    const { _id } = req.auth_user;
    const { page, limit, skip } = parsePagination(req.query);
    const [messages, total] = await Promise.all([
      Message.find({ ownerId: _id }).skip(skip).limit(limit),
      Message.countDocuments({ ownerId: _id }),
    ]);
    return res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};

// Deletes a message. Owners can delete their own messages;
// ADMIN/SUPER_ADMIN role request may be used for moderation.
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, role } = req.auth_user;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const isOwner = message.ownerId.toString() === _id.toString();
    const isAdmin = role === systemRoles.ADMIN || role === systemRoles.SUPER_ADMIN;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Message.deleteOne({ _id: id });
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error(err.message);
    const { status, message } = getErrorResponse(err);
    return res.status(status).json({ message });
  }
};