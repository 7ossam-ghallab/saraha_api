import mongoose from "mongoose";


/**
 * parent - child
 * child - parent
 * embeded document
 */

const messageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps : true})

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);