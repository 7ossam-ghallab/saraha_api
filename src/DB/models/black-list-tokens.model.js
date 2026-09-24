import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  expiryDate: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

const BlackListTokens =
  mongoose.models.BlackListTokens ||
  mongoose.model("BlackListTokens", blackListSchema);

export default BlackListTokens;