import { User } from "../../../DB/models/user.model.js";
import { Message } from "../../../DB/models/messages.model.js";

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
    console.error(err);
    res.status(500).json({ error: err, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate([
      { path: "ownerId", select: "-password" },
    ]);
    return res
      .status(200)
      .json({ message: "Messages retrieved successfully", messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err, message: err.message });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { _id } = req.auth_user;
    // console.log(req.auth_user)
    const messages = await Message.find({ownerId : _id});
    return res.status(200).json({ message: "Messages retrieved successfully", messages });
  }
  catch (err) {
    res.status(500).json({ error: err, message: err.message });
  }
}