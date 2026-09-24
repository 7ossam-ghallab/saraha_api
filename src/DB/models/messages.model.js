import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps : true})

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);