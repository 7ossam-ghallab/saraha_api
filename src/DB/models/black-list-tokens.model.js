import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema({
  tokenId: {type:String, required:true, unique:true},
  expiryDate: {type:String, required:true}
})

const BlackListTokens = mongoose.models.BlackListTokens || mongoose.model('BlackListTokens', blackListSchema)

export default BlackListTokens;